"""Resolves free text ("Riverside", "Palm Springs, CA", "92262") to counties.

County names are matched locally first. Anything else goes to Open-Meteo's
geocoder, which reports the county a city or ZIP code is in.
"""

import re
import unicodedata

from app.clients.open_meteo import OpenMeteoClient
from app.config import Settings
from app.core.cache import TTLCache, UpstreamUnavailable
from app.schemas import SearchResult
from app.services.reference import County, ReferenceData

GEOCODE_PREFIX = "openmeteo:geocode:"
_COUNTY_SUFFIX = re.compile(
    r"\s+(county|parish|borough|census area|municipio|municipality|city and borough)$"
)


def normalize(text: str) -> str:
    """Lowercase, remove accents and periods, and drop any county-type suffix."""
    decomposed = unicodedata.normalize("NFKD", text)
    ascii_text = "".join(c for c in decomposed if not unicodedata.combining(c))
    cleaned = " ".join(ascii_text.lower().replace(".", "").split())
    return _COUNTY_SUFFIX.sub("", cleaned)


def _largest_first(county: County) -> int:
    return -(county.population or 0)


class SearchService:
    def __init__(
        self,
        settings: Settings,
        cache: TTLCache,
        reference: ReferenceData,
        open_meteo: OpenMeteoClient,
    ) -> None:
        self._settings = settings
        self._cache = cache
        self._reference = reference
        self._open_meteo = open_meteo
        self._state_codes = {
            alias: code
            for code, state in reference.states.items()
            for alias in (code.lower(), normalize(state.name))
        }
        self._by_state_and_name = {
            (c.state_code, normalize(c.bare_name)): c for c in reference.counties.values()
        }

    async def search(self, query: str, limit: int) -> list[SearchResult]:
        place, state_code = self._split_state(query)
        if not place:
            return []
        local = self._match_counties(place, state_code)
        if local:
            return [self._result(c) for c in local[:limit]]
        return (await self._match_places(place, state_code))[:limit]

    def _split_state(self, query: str) -> tuple[str, str | None]:
        """Separate an optional trailing state: "Fresno, CA" gives ("Fresno", "CA")."""
        place, _, state_text = query.partition(",")
        return place.strip(), self._state_codes.get(normalize(state_text))

    def _match_counties(self, place: str, state_code: str | None) -> list[County]:
        target = normalize(place)
        exact: list[County] = []
        prefix: list[County] = []
        for county in self._reference.counties.values():
            if state_code and county.state_code != state_code:
                continue
            name = normalize(county.bare_name)
            if name == target:
                exact.append(county)
            elif name.startswith(target):
                prefix.append(county)
        return sorted(exact, key=_largest_first) + sorted(prefix, key=_largest_first)

    async def _match_places(self, place: str, state_code: str | None) -> list[SearchResult]:
        try:
            places = await self._cache.get_or_fetch(
                f"{GEOCODE_PREFIX}{place.lower()}",
                lambda: self._open_meteo.search_places(place),
                self._settings.geocode_ttl_seconds,
            )
        except UpstreamUnavailable:
            return []

        results: dict[str, SearchResult] = {}
        for found in places:
            code = self._state_codes.get(normalize(found.state))
            if code is None or (state_code and code != state_code):
                continue
            county = self._by_state_and_name.get((code, normalize(found.county)))
            if county and county.fips not in results:
                state_name = self._reference.states[code].name
                results[county.fips] = self._result(county, f"{found.name}, {state_name}")
        return list(results.values())

    def _result(self, county: County, matched_place: str | None = None) -> SearchResult:
        return SearchResult(
            fips=county.fips,
            name=county.name,
            state=self._reference.states[county.state_code].name,
            state_code=county.state_code,
            matched_place=matched_place,
        )
