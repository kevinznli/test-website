"""NOAA National Water Prediction Service: river gauges. See claude-docs/apis-usage.md."""

import time
from dataclasses import dataclass

import httpx

GAUGES_URL = "https://api.water.noaa.gov/nwps/v1/gauges"
RATE_LIMIT_BACKOFF_SECONDS = 300


@dataclass(frozen=True)
class Gauge:
    name: str
    observed_category: str
    forecast_category: str


class NwpsClient:
    def __init__(self, http: httpx.AsyncClient) -> None:
        self._http = http
        self._rate_limited_until = 0.0

    async def fetch_gauges(self, bbox: tuple[float, float, float, float]) -> list[Gauge]:
        """Return gauges in a (west, south, east, north) box.

        Always use a box: fetching every gauge takes about 44 seconds and 13 MB.
        """
        if time.monotonic() < self._rate_limited_until:
            raise httpx.HTTPError("NWPS rate limit: backing off")

        west, south, east, north = bbox
        response = await self._http.get(
            GAUGES_URL,
            params={
                "bbox.xmin": west,
                "bbox.ymin": south,
                "bbox.xmax": east,
                "bbox.ymax": north,
                "srid": "EPSG_4326",
            },
        )
        if response.status_code == 429:
            # Applies to every county, since the limit is on us rather than on one
            # request. NWPS publishes no limit and sends no Retry-After header.
            self._rate_limited_until = time.monotonic() + RATE_LIMIT_BACKOFF_SECONDS
        response.raise_for_status()
        return [_parse_gauge(g) for g in response.json().get("gauges") or []]


def _parse_gauge(gauge: dict) -> Gauge:
    status = gauge.get("status") or {}
    return Gauge(
        name=gauge.get("name") or gauge["lid"],
        observed_category=(status.get("observed") or {}).get("floodCategory") or "",
        forecast_category=(status.get("forecast") or {}).get("floodCategory") or "",
    )
