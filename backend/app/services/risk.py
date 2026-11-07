"""Builds the StateRecord, CountyRecord and MapValue responses the frontend consumes."""

import asyncio
from collections.abc import Awaitable, Callable
from enum import StrEnum
from typing import Any

from app.clients.nwps import Gauge, NwpsClient
from app.clients.nws import Alert, NwsClient
from app.clients.open_meteo import Conditions, OpenMeteoClient
from app.clients.usgs import UsgsClient
from app.config import Settings
from app.core.cache import TTLCache, UpstreamUnavailable
from app.domain.hazards import Hazard
from app.domain.scoring import (
    GAUGE_CATEGORY_SCORES,
    LiveSignal,
    composite_score,
    hazard_score,
    tier_for,
    wildfire_weather_score,
    wind_score,
)
from app.schemas import CountyRecord, HazardItem, MapValue, StateRecord
from app.services.reference import County, ReferenceData, State
from app.services.snapshot import Snapshot, alert_importance, build_snapshot, merge_signal

NWS_KEY = "nws:alerts"
USGS_KEY = "usgs:recent"
SNAPSHOT_KEY = "snapshot"
WEATHER_PREFIX = "openmeteo:forecast:"
GAUGES_PREFIX = "nwps:gauges:"

# Alert fields are omitted when there are no alerts. So they must carry this text
# when we couldn't check, or an outage would look the same as "no alerts".
ALERTS_UNKNOWN_TEXT = "NWS alert feed unavailable, so alert status is unknown"
LIVE_UNAVAILABLE_SUFFIX = " (live data unavailable)"
UNKNOWN_POPULATION = "N/A"

_NWS_HAZARDS = frozenset(Hazard) - {Hazard.EARTHQUAKE}
_WEATHER_HAZARDS = frozenset({Hazard.WILDFIRE, Hazard.SEVERE_STORM})


class MapLevel(StrEnum):
    STATE = "state"
    COUNTY = "county"


class MapMetric(StrEnum):
    COMPOSITE = "compositeScore"
    WILDFIRE = Hazard.WILDFIRE.value
    EARTHQUAKE = Hazard.EARTHQUAKE.value
    FLOOD = Hazard.FLOOD.value
    SEVERE_STORM = Hazard.SEVERE_STORM.value
    HURRICANE = Hazard.HURRICANE.value
    TORNADO = Hazard.TORNADO.value


class RiskService:
    def __init__(
        self,
        settings: Settings,
        cache: TTLCache,
        reference: ReferenceData,
        nws: NwsClient,
        usgs: UsgsClient,
        nwps: NwpsClient,
        open_meteo: OpenMeteoClient,
    ) -> None:
        self._settings = settings
        self._cache = cache
        self._reference = reference
        self._nws = nws
        self._usgs = usgs
        self._nwps = nwps
        self._open_meteo = open_meteo

    async def get_snapshot(self) -> Snapshot:
        return await self._cache.get_or_fetch(
            SNAPSHOT_KEY, self._build_snapshot, self._settings.snapshot_ttl_seconds
        )

    async def get_map_values(self, level: MapLevel, metric: MapMetric) -> list[MapValue]:
        snapshot = await self.get_snapshot()
        if level is MapLevel.STATE:
            composites, scores = snapshot.state_composite, snapshot.state_scores
        else:
            composites, scores = snapshot.county_composite, snapshot.county_scores

        if metric is MapMetric.COMPOSITE:
            values = composites
        else:
            hazard = Hazard(metric.value)
            values = {area: area_scores[hazard] for area, area_scores in scores.items()}
        return [MapValue(id=area, value=v, tier=tier_for(v)) for area, v in values.items()]

    async def get_state(self, code: str) -> StateRecord | None:
        state = self._reference.states.get(code)
        if state is None:
            return None
        snapshot = await self.get_snapshot()
        alerts = _unique_alerts(snapshot, state)
        composite = snapshot.state_composite[code]
        return StateRecord(
            code=code,
            name=state.name,
            composite_score=composite,
            tier=tier_for(composite),
            counties_count=len(state.county_fips),
            population=_format_population(state.population),
            active_alert_count=len(alerts) if snapshot.nws_available else None,
            primary_alert=_state_primary_alert(snapshot, state, alerts),
            hazards=self._state_hazards(snapshot, state),
        )

    async def get_county(self, fips: str) -> CountyRecord | None:
        county = self._reference.counties.get(fips)
        if county is None:
            return None
        snapshot, conditions, gauges = await asyncio.gather(
            self.get_snapshot(), self._conditions_for(county), self._gauges_for(county)
        )

        # Start from this county's national signals and add the local ones. This
        # is why a county's detail score can differ from its map value.
        signals = dict(snapshot.signals[county.fips])
        if conditions is not None:
            for signal in _weather_signals(conditions):
                merge_signal(signals, signal)
        if gauges is not None:
            merge_signal(signals, _flood_signal(gauges, conditions))

        unavailable = _unavailable_hazards(snapshot, conditions, gauges)
        scores = {
            hazard: hazard_score(baseline, signals[hazard].score if hazard in signals else 0)
            for hazard, baseline in county.baseline_scores.items()
        }
        hazards = [
            HazardItem(
                name=hazard.label,
                score=score,
                tier=tier_for(score),
                warning=self._county_warning(county, hazard, signals, unavailable),
            )
            for hazard, score in scores.items()
        ]
        hazards.sort(key=lambda h: h.score, reverse=True)

        composite = composite_score(scores.values())
        return CountyRecord(
            name=county.name,
            state=self._reference.states[county.state_code].name,
            state_code=county.state_code,
            composite_score=composite,
            tier=tier_for(composite),
            fips=county.fips,
            pop=_format_population(county.population),
            active_alert=_county_active_alert(snapshot, county),
            hazards=hazards,
        )

    def source_status(self) -> dict[str, Any]:
        return {
            "nws": self._cache.status(NWS_KEY),
            "usgs": self._cache.status(USGS_KEY),
            "openMeteo": self._cache.status(WEATHER_PREFIX),
            "nwps": self._cache.status(GAUGES_PREFIX),
        }

    async def _build_snapshot(self) -> Snapshot:
        ttl = self._settings.feeds_ttl_seconds
        alerts, quakes = await asyncio.gather(
            self._optional(NWS_KEY, self._nws.fetch_active_alerts, ttl),
            self._optional(USGS_KEY, self._usgs.fetch_recent_quakes, ttl),
        )
        return build_snapshot(self._reference, alerts, quakes)

    async def _conditions_for(self, county: County) -> Conditions | None:
        return await self._optional(
            f"{WEATHER_PREFIX}{county.fips}",
            lambda: self._open_meteo.fetch_conditions(county.latitude, county.longitude),
            self._settings.weather_ttl_seconds,
        )

    async def _gauges_for(self, county: County) -> list[Gauge] | None:
        return await self._optional(
            f"{GAUGES_PREFIX}{county.fips}",
            lambda: self._nwps.fetch_gauges(county.bbox),
            self._settings.gauges_ttl_seconds,
        )

    async def _optional(self, key: str, fetch: Callable[[], Awaitable[Any]], ttl: int) -> Any:
        """Fetch through the cache, returning None if the source is unavailable."""
        try:
            return await self._cache.get_or_fetch(key, fetch, ttl)
        except UpstreamUnavailable:
            return None

    def _county_warning(
        self,
        county: County,
        hazard: Hazard,
        signals: dict[Hazard, LiveSignal],
        unavailable: frozenset[Hazard],
    ) -> str:
        if hazard in signals:
            return signals[hazard].text
        text = self._baseline_text(hazard, county.baseline_counts[hazard])
        return text + LIVE_UNAVAILABLE_SUFFIX if hazard in unavailable else text

    def _state_hazards(self, snapshot: Snapshot, state: State) -> list[HazardItem]:
        items = []
        for hazard, score in snapshot.state_scores[state.code].items():
            items.append(
                HazardItem(
                    name=hazard.label,
                    score=score,
                    tier=tier_for(score),
                    warning=self._state_warning(snapshot, state, hazard),
                )
            )
        items.sort(key=lambda h: h.score, reverse=True)
        return items

    def _state_warning(self, snapshot: Snapshot, state: State, hazard: Hazard) -> str:
        signals = [
            snapshot.signals[fips][hazard]
            for fips in state.county_fips
            if hazard in snapshot.signals[fips]
        ]
        if signals:
            strongest = max(signals, key=lambda s: s.score)
            count = sum(1 for s in signals if s.text == strongest.text)
            return f"{strongest.text} ({_plural(count, 'county', 'counties')})"

        if hazard is Hazard.EARTHQUAKE:
            text = self._baseline_text(hazard, state.max_quake_count)
            if state.max_quake_count:
                text = f"Up to {text}, by county"
        else:
            text = self._baseline_text(hazard, state.declarations[hazard])
        live_source_down = (
            not snapshot.usgs_available if hazard is Hazard.EARTHQUAKE else not snapshot.nws_available
        )
        return text + LIVE_UNAVAILABLE_SUFFIX if live_source_down else text

    def _baseline_text(self, hazard: Hazard, count: int) -> str:
        meta = self._reference.meta
        since = meta["baselineSinceYear"]
        if hazard is Hazard.EARTHQUAKE:
            magnitude, radius = meta["quakeMinMagnitude"], meta["quakeRadiusMiles"]
            noun = _plural(count, f"M{magnitude}+ earthquake", f"M{magnitude}+ earthquakes")
            return f"{noun} within {radius} mi since {since}"
        label = hazard.label.lower()
        noun = _plural(count, f"federal {label} declaration", f"federal {label} declarations")
        return f"{noun} since {since}"


def _plural(count: int, singular: str, plural: str) -> str:
    return f"{count:,} {singular if count == 1 else plural}"


def _format_population(population: int | None) -> str:
    return f"{population:,}" if population is not None else UNKNOWN_POPULATION


def _weather_signals(conditions: Conditions) -> list[LiveSignal]:
    humidity = f"{conditions.min_humidity_pct:.0f}%"
    gust = f"{conditions.max_gust_mph:.0f} mph"
    return [
        LiveSignal(
            Hazard.WILDFIRE,
            wildfire_weather_score(conditions.fire_advisory_hour),
            f"Next 24h: humidity as low as {humidity}, gusts to {gust}",
        ),
        LiveSignal(
            Hazard.SEVERE_STORM,
            wind_score(conditions.max_gust_mph),
            f"Next 24h: gusts to {gust}",
        ),
    ]


def _flood_signal(gauges: list[Gauge], conditions: Conditions | None) -> LiveSignal:
    rain = f" · {conditions.total_precip_in:.1f} in rain next 24h" if conditions else ""

    reporting: list[tuple[int, Gauge]] = []
    for gauge in gauges:
        scores = [
            GAUGE_CATEGORY_SCORES[category]
            for category in (gauge.observed_category, gauge.forecast_category)
            if category in GAUGE_CATEGORY_SCORES
        ]
        if scores:
            reporting.append((max(scores), gauge))

    if not reporting:
        return LiveSignal(Hazard.FLOOD, 0, f"No reporting river gauges nearby{rain}")
    score, worst = max(reporting, key=lambda item: item[0])
    if score == 0:
        count = _plural(len(reporting), "nearby gauge", "nearby gauges")
        return LiveSignal(Hazard.FLOOD, 0, f"No flooding at {count}{rain}")
    return LiveSignal(Hazard.FLOOD, score, f"Elevated river stage at {worst.name}{rain}")


def _unavailable_hazards(
    snapshot: Snapshot, conditions: Conditions | None, gauges: list[Gauge] | None
) -> frozenset[Hazard]:
    unavailable: set[Hazard] = set()
    if not snapshot.nws_available:
        unavailable |= _NWS_HAZARDS
    if not snapshot.usgs_available:
        unavailable.add(Hazard.EARTHQUAKE)
    if conditions is None:
        unavailable |= _WEATHER_HAZARDS
    if gauges is None:
        unavailable.add(Hazard.FLOOD)
    return frozenset(unavailable)


def _county_active_alert(snapshot: Snapshot, county: County) -> str | None:
    if not snapshot.nws_available:
        return ALERTS_UNKNOWN_TEXT
    alerts = snapshot.alerts.get(county.fips)
    if not alerts:
        return None
    extra = f" (+{len(alerts) - 1} more)" if len(alerts) > 1 else ""
    return f"{alerts[0].headline}{extra}"


def _unique_alerts(snapshot: Snapshot, state: State) -> list[Alert]:
    unique: dict[str, Alert] = {}
    for fips in state.county_fips:
        for alert in snapshot.alerts.get(fips, []):
            unique[alert.id] = alert
    return list(unique.values())


def _state_primary_alert(snapshot: Snapshot, state: State, alerts: list[Alert]) -> str | None:
    if not snapshot.nws_available:
        return ALERTS_UNKNOWN_TEXT
    if not alerts:
        return None
    top_event = max(alerts, key=alert_importance).event
    in_state = set(state.county_fips)
    counties = {
        fips for alert in alerts if alert.event == top_event for fips in alert.county_fips
    } & in_state
    others = sum(1 for alert in alerts if alert.event != top_event)
    extra = f" (+{_plural(others, 'other alert', 'other alerts')})" if others else ""
    return f"{top_event} in {_plural(len(counties), 'county', 'counties')}{extra}"
