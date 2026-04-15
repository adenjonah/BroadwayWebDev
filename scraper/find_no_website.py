"""Entry point: find businesses near a lat/lng with no website.

Usage:
    python -m scraper.find_no_website --lat 40.7128 --lng -74.0060 \
        --radius-miles 5 --query "restaurant" --out results.csv
"""
from __future__ import annotations

import argparse
import csv
import os
import random
import sys
from pathlib import Path

from dotenv import load_dotenv

from .places import Place, PlacesClient, haversine_m, miles_to_meters, tile_circle
from .verify_web import has_discoverable_website, polite_sleep


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Find businesses with no website.")
    p.add_argument("--lat", type=float, required=True)
    p.add_argument("--lng", type=float, required=True)
    p.add_argument("--radius-miles", type=float, required=True)
    p.add_argument("--query", type=str, default="", help="Optional text query, e.g. 'plumber'")
    p.add_argument("--out", type=Path, default=Path("results.csv"))
    p.add_argument("--no-verify-web", action="store_true",
                   help="Skip secondary web-search verification")
    p.add_argument("--verify-delay", type=float, default=4.0,
                   help="Seconds between DDG verification calls (default 4.0)")
    p.add_argument("--verify-jitter", type=float, default=2.0,
                   help="Random extra delay 0..N seconds (default 2.0)")
    p.add_argument("--tile-miles", type=float, default=2.0,
                   help="Sub-circle radius when tiling large areas (default 2 mi)")
    return p.parse_args()


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
        print(f"[info] tile {i}/{len(tiles)}: +{len(results)} (total unique: {len(found)})",
              file=sys.stderr)
    return found


def main() -> int:
    load_dotenv()
    args = parse_args()

    api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        print("error: GOOGLE_MAPS_API_KEY not set (see .env.example)", file=sys.stderr)
        return 1

    client = PlacesClient(api_key)
    places = collect_places(client, args)

    # Hard-clip to the requested radius (Text Search uses soft locationBias).
    radius_m = miles_to_meters(args.radius_miles)
    before = len(places)
    places = {
        pid: p for pid, p in places.items()
        if haversine_m(args.lat, args.lng, p.lat, p.lng) <= radius_m
    }
    print(f"[info] {len(places)}/{before} within {args.radius_miles} mi", file=sys.stderr)

    # Stage 1: drop anything with a website on its Google profile.
    no_gbp_site = [p for p in places.values() if not p.has_website]
    print(f"[info] {len(no_gbp_site)}/{len(places)} have no website on Google profile",
          file=sys.stderr)

    # Stage 2: secondary verification via web search.
    final: list[Place] = []
    if args.no_verify_web:
        final = no_gbp_site
    else:
        for i, pl in enumerate(no_gbp_site, 1):
            print(f"[verify] {i}/{len(no_gbp_site)} {pl.name}", file=sys.stderr)
            if not has_discoverable_website(pl.name, pl.address):
                final.append(pl)
            polite_sleep(args.verify_delay + random.uniform(0, args.verify_jitter))

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["name", "address", "phone", "lat", "lng",
                    "place_id", "google_maps_url", "categories"])
        for pl in final:
            w.writerow([
                pl.name, pl.address, pl.phone, pl.lat, pl.lng,
                pl.place_id, pl.google_maps_url, "|".join(pl.types),
            ])

    print(f"[done] wrote {len(final)} rows to {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
