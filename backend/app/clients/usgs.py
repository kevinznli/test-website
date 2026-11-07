"""USGS Earthquake Catalog: recent earthquakes. See claude-docs/apis-usage.md."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import httpx

QUERY_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
RECENT_DAYS = 7
MIN_MAGNITUDE = 3.0  # The smallest magnitude the scoring model uses


@dataclass(frozen=True)
class Quake:
    magnitude: float
    place: str
    latitude: float
    longitude: float


class UsgsClient:
    def __init__(self, http: httpx.AsyncClient) -> None:
        self._http = http

    async def fetch_recent_quakes(self) -> list[Quake]:
        """Return worldwide M3+ earthquakes from the last week."""
        start = datetime.now(UTC) - timedelta(days=RECENT_DAYS)
        response = await self._http.get(
            QUERY_URL,
            params={
                "format": "geojson",
                "eventtype": "earthquake",
                "starttime": start.strftime("%Y-%m-%dT%H:%M:%S"),
                "minmagnitude": MIN_MAGNITUDE,
            },
        )
        response.raise_for_status()
        return [_parse_quake(f) for f in response.json()["features"]]


def _parse_quake(feature: dict) -> Quake:
    longitude, latitude, *_ = feature["geometry"]["coordinates"]
    properties = feature["properties"]
    return Quake(
        magnitude=float(properties["mag"]),
        place=properties.get("place") or "unknown location",
        latitude=float(latitude),
        longitude=float(longitude),
    )
