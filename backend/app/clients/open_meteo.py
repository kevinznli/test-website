"""Open-Meteo: weather forecast and place search. See claude-docs/apis-usage.md."""

from dataclasses import dataclass

import httpx

from app.domain.scoring import FIRE_GUST_LIMIT_MPH, FIRE_RH_LIMIT

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_HOURS = 24


@dataclass(frozen=True)
class Conditions:
    """A summary of the next 24 hours of forecast at one point."""

    max_gust_mph: float
    min_humidity_pct: float
    total_precip_in: float
    fire_advisory_hour: bool  # An hour with both low humidity and strong gusts


@dataclass(frozen=True)
class Place:
    name: str
    state: str
    county: str


class OpenMeteoClient:
    def __init__(self, http: httpx.AsyncClient) -> None:
        self._http = http

    async def fetch_conditions(self, latitude: float, longitude: float) -> Conditions:
        response = await self._http.get(
            FORECAST_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "hourly": "wind_gusts_10m,relative_humidity_2m,precipitation",
                "wind_speed_unit": "mph",
                "precipitation_unit": "inch",
                "forecast_hours": FORECAST_HOURS,
            },
        )
        response.raise_for_status()
        return _summarize(response.json()["hourly"])

    async def search_places(self, query: str) -> list[Place]:
        """Find US places by name or ZIP code."""
        response = await self._http.get(
            GEOCODING_URL,
            params={
                "name": query,
                "count": 10,
                "countryCode": "US",
                "language": "en",
                "format": "json",
            },
        )
        response.raise_for_status()
        return [
            Place(name=r["name"], state=r["admin1"], county=r["admin2"])
            for r in response.json().get("results") or []
            if r.get("admin1") and r.get("admin2")
        ]


def _summarize(hourly: dict) -> Conditions:
    # Open-Meteo can return null for individual hours, so keep complete hours only.
    hours = [
        (gust, rh, rain or 0.0)
        for gust, rh, rain in zip(
            hourly["wind_gusts_10m"],
            hourly["relative_humidity_2m"],
            hourly["precipitation"],
            strict=True,
        )
        if gust is not None and rh is not None
    ]
    if not hours:
        raise ValueError("Open-Meteo returned no complete forecast hours")
    return Conditions(
        max_gust_mph=max(h[0] for h in hours),
        min_humidity_pct=min(h[1] for h in hours),
        total_precip_in=sum(h[2] for h in hours),
        fire_advisory_hour=any(
            rh <= FIRE_RH_LIMIT and gust >= FIRE_GUST_LIMIT_MPH for gust, rh, _ in hours
        ),
    )
