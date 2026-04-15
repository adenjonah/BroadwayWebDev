"""Find businesses that need a website near a given location.

Each search creates a directory under scraper/searches/ keyed by
coordinates + radius. Two JSON files are written:
  - all.json      — every place found in the search area
  - qualified.json — no-website businesses that would benefit from a site

Usage:
    python -m scraper.find_leads --lat 47.738 --lng -117.513 --radius-miles 3
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from .categories import is_qualified_business
from .places import Place, PlacesClient, haversine_m, miles_to_meters, tile_circle
from .verify_web import has_discoverable_website, polite_sleep

SEARCHES_DIR = Path(__file__).parent / "searches"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Find lead businesses with no website.")
    p.add_argument("--lat", type=float, required=True)
    p.add_argument("--lng", type=float, required=True)
    p.add_argument("--radius-miles", type=float, required=True)
    p.add_argument("--query", type=str, default="",
                   help="Optional text query, e.g. 'plumber'")
    p.add_argument("--no-verify-web", action="store_true",
                   help="Skip secondary web-search verification")
    p.add_argument("--verify-delay", type=float, default=4.0,
                   help="Seconds between DDG verification calls (default 4.0)")
    p.add_argument("--verify-jitter", type=float, default=2.0,
                   help="Random extra delay 0..N seconds (default 2.0)")
    p.add_argument("--tile-miles", type=float, default=2.0,
                   help="Sub-circle radius when tiling large areas (default 2 mi)")
    return p.parse_args()


def search_dir_name(lat: float, lng: float, radius_miles: float) -> str:
    """Deterministic directory name from search params."""
    lat_s = f"{lat:.3f}"
    lng_s = f"{lng:.3f}"
    return f"{lat_s}_{lng_s}_{radius_miles}mi"


def collect_places(client: PlacesClient, args: argparse.Namespace) -> dict[str, Place]:
    radius_m = miles_to_meters(args.radius_miles)
    tile_radius_m = miles_to_meters(args.tile_miles)
    tiles = tile_circle(args.lat, args.lng, radius_m, tile_radius_m=tile_radius_m)
    print(f"[info] searching {len(tiles)} tile(s)", file=sys.stderr)

    found: dict[str, Place] = {}
    for i, (tlat, tlng, trad) in enumerate(tiles, 1):
        try:
            if args.query:
                results = list(client.text_search(args.query, tlat, tlng, trad))
            else:
                results = client.nearby(tlat, tlng, trad)
        except RuntimeError as e:
            print(f"[warn] tile {i} failed: {e}", file=sys.stderr)
            continue
        for pl in results:
            found[pl.place_id] = pl
        print(f"[info] tile {i}/{len(tiles)}: +{len(results)} "
              f"(total unique: {len(found)})", file=sys.stderr)
    return found


def write_results(
    search_path: Path,
    all_places: list[Place],
    qualified: list[Place],
    args: argparse.Namespace,
) -> None:
    search_path.mkdir(parents=True, exist_ok=True)

    metadata = {
        "search": {
            "lat": args.lat,
            "lng": args.lng,
            "radius_miles": args.radius_miles,
            "query": args.query or None,
            "verified_web": not args.no_verify_web,
            "ran_at": datetime.now(timezone.utc).isoformat(),
        },
        "stats": {
            "total_found": len(all_places),
            "no_website": sum(1 for p in all_places if not p.has_website),
            "qualified": len(qualified),
        },
    }

    all_data = {**metadata, "places": [p.to_dict() for p in all_places]}
    qualified_data = {**metadata, "leads": [p.to_dict() for p in qualified]}

    all_path = search_path / "all.json"
    qualified_path = search_path / "qualified.json"
    summary_path = search_path / "summary.txt"

    all_path.write_text(json.dumps(all_data, indent=2, ensure_ascii=False))
    qualified_path.write_text(json.dumps(qualified_data, indent=2, ensure_ascii=False))

    summary_lines = [
        f"Search: {args.lat}, {args.lng} — {args.radius_miles} mi radius",
        f"Query: {args.query or '(all businesses)'}",
        f"Date: {metadata['search']['ran_at']}",
        "",
        f"Total places found: {len(all_places)}",
        f"No website on Google: {metadata['stats']['no_website']}",
        f"Qualified leads: {len(qualified)}",
        "",
        "--- Qualified Leads ---",
        "",
    ]
    for p in qualified:
        summary_lines.append(f"  {p.name}")
        summary_lines.append(f"    {p.address}")
        if p.phone:
            summary_lines.append(f"    Phone: {p.phone}")
        summary_lines.append(f"    Type: {p.primary_type or ', '.join(p.types)}")
        summary_lines.append(f"    Maps: {p.google_maps_url}")
        summary_lines.append("")

    summary_path.write_text("\n".join(summary_lines))


def main() -> int:
    load_dotenv()
    args = parse_args()

    api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        print("error: GOOGLE_MAPS_API_KEY not set (see .env.example)", file=sys.stderr)
        return 1

    # Set up output directory
    dir_name = search_dir_name(args.lat, args.lng, args.radius_miles)
    search_path = SEARCHES_DIR / dir_name
    print(f"[info] output → {search_path}", file=sys.stderr)

    client = PlacesClient(api_key)
    places = collect_places(client, args)

    # Hard-clip to the requested radius (Text Search uses soft locationBias).
    radius_m = miles_to_meters(args.radius_miles)
    before = len(places)
    places = {
        pid: p for pid, p in places.items()
        if haversine_m(args.lat, args.lng, p.lat, p.lng) <= radius_m
    }
    all_places = list(places.values())
    print(f"[info] {len(all_places)}/{before} within {args.radius_miles} mi",
          file=sys.stderr)

    # Stage 1: filter to businesses that would benefit from a website.
    candidates = [
        p for p in all_places
        if not p.has_website and is_qualified_business(p.types)
    ]
    non_biz = sum(
        1 for p in all_places
        if not p.has_website and not is_qualified_business(p.types)
    )
    print(f"[info] {len(candidates)} candidates without website "
          f"({non_biz} non-business skipped)", file=sys.stderr)

    # Stage 2: secondary verification via web search.
    qualified: list[Place] = []
    if args.no_verify_web:
        qualified = candidates
    else:
        for i, pl in enumerate(candidates, 1):
            print(f"[verify] {i}/{len(candidates)} {pl.name}", file=sys.stderr)
            if not has_discoverable_website(pl.name, pl.address):
                qualified.append(pl)
            polite_sleep(args.verify_delay + random.uniform(0, args.verify_jitter))

    write_results(search_path, all_places, qualified, args)

    print(f"[done] {len(qualified)} qualified leads → {search_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
