"""Google Places API (New) client.

Docs: https://developers.google.com/maps/documentation/places/web-service/search-nearby
"""
from __future__ import annotations

import math
import time
from dataclasses import dataclass
from typing import Iterator

import requests

PLACES_SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"

# Fields we care about. Billed per field mask — keep tight.
_PLACE_FIELDS = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.types",
    "places.primaryType",
]
NEARBY_FIELD_MASK = ",".join(_PLACE_FIELDS)
TEXT_FIELD_MASK = ",".join(["nextPageToken", *_PLACE_FIELDS])

# Places API New caps at 50 results per request for Nearby and ~20 per page
# for Text Search (up to 60 with pagination). Max radius for Nearby: 50000 m.
MAX_NEARBY_RADIUS_M = 50_000
METERS_PER_MILE = 1609.344

# Category sweep used when the caller has no user-specified query_filter.
# Each term is a text search performed per tile; results are merged + deduped
# by place_id. Covers the business universe in scoring.STRONG_BUSINESS_TYPES.
# Keep this list tight — every entry ~multiplies Google API cost per tile.
CATEGORY_QUERIES: tuple[str, ...] = (
    "restaurant",
    "cafe coffee bakery",
    "bar pub",
    "hair salon barber",
    "nail salon spa",
    "laundromat dry cleaner",
    "auto repair car wash",
    "plumber electrician contractor",
    "retail store",
    "grocery pharmacy convenience",
    "dentist doctor chiropractor",
    "gym fitness studio",
    "lawyer accountant insurance",
    "florist pet store",
)


@dataclass(frozen=True)
class Place:
    place_id: str
    name: str
    address: str
    lat: float
    lng: float
    phone: str
    website: str
    google_maps_url: str
    types: tuple[str, ...]
    primary_type: str = ""

    @property
    def has_website(self) -> bool:
        return bool(self.website and self.website.strip())

    def to_dict(self) -> dict:
        return {
            "place_id": self.place_id,
            "name": self.name,
            "address": self.address,
            "lat": self.lat,
            "lng": self.lng,
            "phone": self.phone,
            "website": self.website,
            "google_maps_url": self.google_maps_url,
            "primary_type": self.primary_type,
            "types": list(self.types),
        }


def _parse_place(raw: dict) -> Place:
    loc = raw.get("location") or {}
    return Place(
        place_id=raw.get("id", ""),
        name=(raw.get("displayName") or {}).get("text", ""),
        address=raw.get("formattedAddress", ""),
        lat=float(loc.get("latitude", 0.0)),
        lng=float(loc.get("longitude", 0.0)),
        phone=raw.get("nationalPhoneNumber") or raw.get("internationalPhoneNumber") or "",
        website=raw.get("websiteUri", ""),
        google_maps_url=raw.get("googleMapsUri", ""),
        types=tuple(raw.get("types") or []),
        primary_type=raw.get("primaryType", ""),
    )


class PlacesClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY is required")
        self.api_key = api_key
        self.session = requests.Session()

    def _headers(self, field_mask: str) -> dict:
        return {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": field_mask,
        }

    def nearby(
        self,
        lat: float,
        lng: float,
        radius_m: float,
        included_types: list[str] | None = None,
        max_results: int = 20,
    ) -> list[Place]:
        """Nearby search — returns all business types by default."""
        radius_m = min(radius_m, MAX_NEARBY_RADIUS_M)
        body = {
            "maxResultCount": max_results,
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": radius_m,
                }
            },
        }
        if included_types:
            body["includedTypes"] = included_types

        resp = self.session.post(PLACES_SEARCH_NEARBY_URL, json=body, headers=self._headers(NEARBY_FIELD_MASK), timeout=30)
        if resp.status_code != 200:
            raise RuntimeError(f"Places nearby failed {resp.status_code}: {resp.text}")
        return [_parse_place(p) for p in (resp.json().get("places") or [])]

    def text_search(
        self,
        query: str,
        lat: float,
        lng: float,
        radius_m: float,
        page_size: int = 20,
    ) -> Iterator[Place]:
        """Text search with pagination. Yields up to ~60 places."""
        radius_m = min(radius_m, MAX_NEARBY_RADIUS_M)
        page_token: str | None = None
        for _ in range(3):  # API caps at 3 pages
            body: dict = {
                "textQuery": query,
                "pageSize": page_size,
                "locationBias": {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": radius_m,
                    }
                },
            }
            if page_token:
                body["pageToken"] = page_token
            resp = self.session.post(PLACES_SEARCH_TEXT_URL, json=body, headers=self._headers(TEXT_FIELD_MASK), timeout=30)
            if resp.status_code != 200:
                raise RuntimeError(f"Places text search failed {resp.status_code}: {resp.text}")
            data = resp.json()
            for raw in data.get("places") or []:
                yield _parse_place(raw)
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            time.sleep(2)  # next page token has a short warmup window


def miles_to_meters(miles: float) -> float:
    return miles * METERS_PER_MILE


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6_371_000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def tile_circle(lat: float, lng: float, radius_m: float, tile_radius_m: float = 3000.0) -> list[tuple[float, float, float]]:
    """Tile a large circle into overlapping sub-circles.

    Returns list of (lat, lng, radius_m). Useful because Nearby Search caps
    at 20 results per request — dense urban areas will be truncated.
    """
    if radius_m <= tile_radius_m:
        return [(lat, lng, radius_m)]

    # Approx degrees per meter
    lat_deg_per_m = 1 / 111_320
    lng_deg_per_m = 1 / (111_320 * math.cos(math.radians(lat)))

    step_m = tile_radius_m * 1.5  # overlap
    n = int(math.ceil(radius_m / step_m))
    tiles: list[tuple[float, float, float]] = []
    for dy in range(-n, n + 1):
        for dx in range(-n, n + 1):
            cx_m = dx * step_m
            cy_m = dy * step_m
            if math.hypot(cx_m, cy_m) > radius_m + tile_radius_m:
                continue
            tlat = lat + cy_m * lat_deg_per_m
            tlng = lng + cx_m * lng_deg_per_m
            tiles.append((tlat, tlng, tile_radius_m))
    return tiles
