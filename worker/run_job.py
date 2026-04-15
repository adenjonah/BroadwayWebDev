"""Job execution logic — adapted from scraper/find_leads.py for cloud execution."""

import os
import sys
import time
import random

from places import PlacesClient, tile_circle, miles_to_meters, haversine_m
from categories import is_qualified_business
from verify_web import has_discoverable_website
from db import SupabaseDB

VERIFY_DELAY = 4.0
VERIFY_JITTER = 2.0
TILE_MILES = 2.0


def _polite_sleep(base: float, jitter: float) -> None:
    time.sleep(base + random.uniform(0, jitter))


def execute_job(job_id: str) -> None:
    """Run a scrape job end-to-end, writing results to Supabase."""
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

    try:
        # Calculate tiles
        tiles = tile_circle(lat, lng, radius_m, tile_m)
        db.start_job(job_id, tiles_total=len(tiles))
        print(f"Job {job_id}: {len(tiles)} tiles, radius {radius_miles}mi")

        # Stage 1: Collect all places from Google
        found: dict[str, object] = {}

        for i, (tlat, tlng, tradius) in enumerate(tiles):
            try:
                if query_filter:
                    for place in client.text_search(
                        query_filter, tlat, tlng, tradius
                    ):
                        found[place.place_id] = place
                else:
                    for place in client.nearby(tlat, tlng, tradius):
                        found[place.place_id] = place
            except RuntimeError as exc:
                print(f"  Tile {i + 1} failed: {exc}", file=sys.stderr)

            db.update_progress(job_id, tiles_done=i + 1, total_found=len(found))

        # Hard-clip to actual radius (text search uses soft bias)
        clipped = {
            pid: p
            for pid, p in found.items()
            if haversine_m(lat, lng, p.lat, p.lng) <= radius_m
        }

        print(f"  Found {len(found)} places, {len(clipped)} within radius")

        # Stage 2: Filter — no website + qualified business type
        candidates = [
            p
            for p in clipped.values()
            if not p.has_website and is_qualified_business(p.types)
        ]

        print(f"  {len(candidates)} candidates for web verification")

        # Update DB with candidate count so UI can show verification progress
        db.update_job(job_id, candidates_total=len(candidates), candidates_verified=0)

        # Stage 3: DDG verification + insert leads
        qualified_count = 0

        for i, candidate in enumerate(candidates):
            if not has_discoverable_website(candidate.name, candidate.address):
                inserted = db.insert_lead(candidate, job_id)
                if inserted:
                    qualified_count += 1
                    print(f"  Lead: {candidate.name}")

            db.update_job(
                job_id,
                candidates_verified=i + 1,
                qualified_count=qualified_count,
            )
            _polite_sleep(VERIFY_DELAY, VERIFY_JITTER)

        # Store all found places for viewing in the admin UI
        all_places = [p.to_dict() for p in clipped.values()]

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
