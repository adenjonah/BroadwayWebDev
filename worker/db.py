"""Supabase database helpers for the scrape worker."""

import os
from datetime import datetime, timezone

from supabase import create_client, Client

from places import Place
from scoring import calculate_lead_score


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SupabaseDB:
    """Thin wrapper around the Supabase Python client for job/lead operations."""

    def __init__(self) -> None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        self._client: Client = create_client(url, key)

    def get_job(self, job_id: str) -> dict:
        result = (
            self._client.table("scrape_jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )
        return result.data

    def update_job(self, job_id: str, **fields: object) -> None:
        self._client.table("scrape_jobs").update(fields).eq("id", job_id).execute()

    def start_job(self, job_id: str, tiles_total: int) -> None:
        self.update_job(
            job_id,
            status="running",
            started_at=_now(),
            tiles_total=tiles_total,
        )

    def update_progress(
        self, job_id: str, tiles_done: int, total_found: int
    ) -> None:
        self.update_job(job_id, tiles_done=tiles_done, total_found=total_found)

    def update_tile_progress(
        self,
        job_id: str,
        tile_idx: int,
        tiles_done: int,
        category: str,
        total_found: int,
    ) -> None:
        """Single-write progress update used during the tile/category sweep."""
        self.update_job(
            job_id,
            current_tile=tile_idx,
            tiles_done=tiles_done,
            current_category=category,
            total_found=total_found,
        )

    def complete_job(
        self, job_id: str, qualified_count: int, found_places: list[dict]
    ) -> None:
        self.update_job(
            job_id,
            status="completed",
            qualified_count=qualified_count,
            found_places=found_places,
            completed_at=_now(),
        )

    def fail_job(self, job_id: str, error_message: str) -> None:
        self.update_job(
            job_id,
            status="failed",
            error_message=error_message[:500],
            completed_at=_now(),
        )

    def insert_lead(
        self,
        place: Place,
        job_id: str,
        discovered_website: str = "",
    ) -> bool:
        """Insert a lead. Returns True if inserted, False if duplicate.

        discovered_website is whatever DDG turned up during secondary
        verification (empty string if nothing). The Postgres scoring
        trigger uses it to decide whether to grant the "no website" +1.
        """
        score = calculate_lead_score(
            place.phone,
            place.primary_type,
            place.types,
            discovered_website,
        )

        row = {
            "place_id": place.place_id,
            "name": place.name,
            "address": place.address,
            "lat": place.lat,
            "lng": place.lng,
            "phone": place.phone,
            "google_maps_url": place.google_maps_url,
            "primary_type": place.primary_type,
            "types": list(place.types),
            "lead_score": score,
            "discovered_website": discovered_website,
            "scrape_job_id": job_id,
        }

        result = (
            self._client.table("leads")
            .upsert(row, on_conflict="place_id", ignore_duplicates=True)
            .execute()
        )
        return len(result.data) > 0
