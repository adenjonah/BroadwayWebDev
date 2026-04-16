"""Job execution logic — adapted from scraper/find_leads.py for cloud execution."""

import os
import sys
import time
import random

from places import (
    Place,
    PlacesClient,
    tile_circle,
    miles_to_meters,
    haversine_m,
    CATEGORY_QUERIES,
)
from categories import is_qualified_business
from verify_web import find_discoverable_website
from db import SupabaseDB

VERIFY_DELAY = 4.0
VERIFY_JITTER = 2.0
TILE_MILES = 0.4
CATEGORY_SLEEP = 0.2  # polite pause between category queries within a tile


def _polite_sleep(base: float, jitter: float) -> None:
    time.sleep(base + random.uniform(0, jitter))


def _place_from_dict(d: dict) -> Place:
    """Rebuild a Place from the JSON snapshot persisted during a previous run."""
    return Place(
        place_id=d.get("place_id", ""),
        name=d.get("name", ""),
        address=d.get("address", ""),
        lat=float(d.get("lat", 0.0) or 0.0),
        lng=float(d.get("lng", 0.0) or 0.0),
        phone=d.get("phone", ""),
        website=d.get("website", ""),
        google_maps_url=d.get("google_maps_url", ""),
        types=tuple(d.get("types") or []),
        primary_type=d.get("primary_type", ""),
    )


def execute_job(job_id: str) -> None:
    """Run a scrape job end-to-end, writing results to Supabase.

    Resume-safe: picks up progress from tiles_done, found_places, and the
    existing leads table if the worker was killed mid-scan on a prior run.
    """
    db = SupabaseDB()
    job = db.get_job(job_id)

    if job["status"] != "pending":
        print(f"Job {job_id} is not pending (status: {job['status']}), skipping")
        return

    api_key = os.environ["GOOGLE_MAPS_API_KEY"]
    client = PlacesClient(api_key)

    lat = job["center_lat"]
    lng = job["center_lng"]
    radius_miles = job["radius_miles"]
    query_filter = job["query_filter"] or ""
    radius_m = miles_to_meters(radius_miles)
    tile_m = miles_to_meters(TILE_MILES)

    # ── Resume state ─────────────────────────────────────────
    resume_tiles_done = int(job.get("tiles_done") or 0)
    resume_found_raw = job.get("found_places") or []
    resuming = resume_tiles_done > 0 or len(resume_found_raw) > 0

    try:
        tiles = tile_circle(lat, lng, radius_m, tile_m)

        if resuming:
            db.resume_job(job_id)
            print(
                f"Job {job_id}: RESUMING from tile {resume_tiles_done}/{len(tiles)}, "
                f"{len(resume_found_raw)} places already persisted"
            )
        else:
            db.start_job(job_id, tiles_total=len(tiles))
            print(f"Job {job_id}: {len(tiles)} tiles, radius {radius_miles}mi")

        # Rebuild the accumulated found dict from prior snapshot.
        found: dict[str, Place] = {}
        for d in resume_found_raw:
            if isinstance(d, dict) and d.get("place_id"):
                found[d["place_id"]] = _place_from_dict(d)

        # Stage 1: Collect places from Google (skip tiles already done).
        for i, (tlat, tlng, tradius) in enumerate(tiles):
            if i < resume_tiles_done:
                continue
            tile_idx = i + 1

            if query_filter:
                db.update_tile_progress(
                    job_id,
                    tile_idx=tile_idx,
                    tiles_done=i,
                    category=query_filter,
                    total_found=len(found),
                )
                try:
                    for place in client.text_search(
                        query_filter, tlat, tlng, tradius
                    ):
                        found[place.place_id] = place
                except RuntimeError as exc:
                    print(f"  Tile {tile_idx} failed: {exc}", file=sys.stderr)
            else:
                for cat in CATEGORY_QUERIES:
                    db.update_tile_progress(
                        job_id,
                        tile_idx=tile_idx,
                        tiles_done=i,
                        category=cat,
                        total_found=len(found),
                    )
                    try:
                        for place in client.text_search(cat, tlat, tlng, tradius):
                            found[place.place_id] = place
                    except RuntimeError as exc:
                        print(
                            f"  Tile {tile_idx} cat '{cat}' failed: {exc}",
                            file=sys.stderr,
                        )
                    time.sleep(CATEGORY_SLEEP)

            # End-of-tile: persist the accumulated place list so a crash
            # here doesn't lose a tile's worth of work.
            db.persist_found_places(
                job_id,
                places=[p.to_dict() for p in found.values()],
            )
            db.update_tile_progress(
                job_id,
                tile_idx=tile_idx,
                tiles_done=tile_idx,
                category="",
                total_found=len(found),
            )

        # Hard-clip to actual radius (text search uses soft bias).
        clipped = {
            pid: p
            for pid, p in found.items()
            if haversine_m(lat, lng, p.lat, p.lng) <= radius_m
        }

        print(f"  Found {len(found)} places, {len(clipped)} within radius")

        # Stage 2: Filter — no website + qualified business type.
        candidates = [
            p
            for p in clipped.values()
            if not p.has_website and is_qualified_business(p.types)
        ]

        print(f"  {len(candidates)} candidates for web verification")

        # Stage 3: DDG secondary check + insert each qualified candidate.
        # Skip candidates whose place_id is already a lead on this job —
        # that's how we pick up mid-verify resumes without double-inserting.
        existing_place_ids = db.get_existing_lead_place_ids(job_id)
        already_done = len(existing_place_ids)

        # Candidates get sorted deterministically so a resumed run picks up
        # in the same order it was originally processing.
        candidates.sort(key=lambda p: p.place_id)

        db.update_verify_progress(
            job_id,
            candidates_total=len(candidates),
            candidates_verified=already_done,
        )

        qualified_count = already_done
        ddg_urls: dict[str, str] = {}

        for i, candidate in enumerate(candidates):
            if candidate.place_id in existing_place_ids:
                continue

            discovered = find_discoverable_website(candidate.name, candidate.address)
            if discovered:
                ddg_urls[candidate.place_id] = discovered

            inserted = db.insert_lead(
                candidate, job_id, discovered_website=discovered
            )
            if inserted:
                qualified_count += 1
                tag = f" (discovered: {discovered})" if discovered else ""
                print(f"  Lead: {candidate.name}{tag}")

            db.update_verify_progress(
                job_id,
                candidates_verified=i + 1,
                qualified_count=qualified_count,
            )
            _polite_sleep(VERIFY_DELAY, VERIFY_JITTER)

        # Store all found places for viewing in the admin UI. Overlay any
        # DDG-discovered URLs onto the place dicts.
        all_places = []
        for p in clipped.values():
            d = p.to_dict()
            if p.place_id in ddg_urls:
                d["discovered_website"] = ddg_urls[p.place_id]
            all_places.append(d)

        db.complete_job(
            job_id,
            qualified_count=qualified_count,
            found_places=all_places,
        )
        print(f"Job {job_id} completed: {qualified_count} leads")

    except Exception as exc:
        db.fail_job(job_id, str(exc))
        print(f"Job {job_id} failed: {exc}", file=sys.stderr)
        raise
