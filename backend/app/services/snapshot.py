"""National scores, computed from the static baseline plus the two nationwide live feeds.

NWS alerts and USGS earthquakes each take one call for the whole country, so
they can score every county. Open-Meteo and NWPS can't, so they're only used for
single-county requests (see services/risk.py).
"""

from dataclasses import dataclass

import numpy as np

from app.clients.nws import Alert
from app.clients.usgs import Quake
from app.domain.geo import distance_to_boxes_miles
from app.domain.hazards import ALERT_RULES, Hazard
from app.domain.scoring import (
    QUAKE_RADIUS_MILES,
    LiveSignal,
    alert_signal,
    composite_score,
    hazard_score,
    quake_score,
)
from app.services.reference import ReferenceData

_SEVERITY_RANK = {"Extreme": 4, "Severe": 3, "Moderate": 2, "Minor": 1}


@dataclass(frozen=True)
class Snapshot:
    signals: dict[str, dict[Hazard, LiveSignal]]  # Strongest signal by county and hazard
    alerts: dict[str, list[Alert]]  # By county, most important first
    county_scores: dict[str, dict[Hazard, int]]
    county_composite: dict[str, int]
    state_scores: dict[str, dict[Hazard, int]]
    state_composite: dict[str, int]
    nws_available: bool
    usgs_available: bool


def alert_importance(alert: Alert) -> tuple[int, int]:
    rule = ALERT_RULES.get(alert.event)
    return (rule[1] if rule else 0, _SEVERITY_RANK.get(alert.severity, 0))


def merge_signal(signals: dict[Hazard, LiveSignal], signal: LiveSignal) -> None:
    """Keep the stronger signal for a hazard. On a tie, the existing one stays."""
    current = signals.get(signal.hazard)
    if current is None or signal.score > current.score:
        signals[signal.hazard] = signal


def build_snapshot(
    reference: ReferenceData, alerts: list[Alert] | None, quakes: list[Quake] | None
) -> Snapshot:
    """Compute scores. `None` for a feed means that source is unavailable."""
    signals: dict[str, dict[Hazard, LiveSignal]] = {fips: {} for fips in reference.counties}
    alerts_by_county = _apply_alerts(reference, alerts or [], signals)
    _apply_quakes(reference, quakes or [], signals)

    county_scores = {
        fips: {
            hazard: hazard_score(
                baseline, signals[fips][hazard].score if hazard in signals[fips] else 0
            )
            for hazard, baseline in county.baseline_scores.items()
        }
        for fips, county in reference.counties.items()
    }
    state_scores = {
        code: _population_weighted(reference, state.county_fips, county_scores)
        for code, state in reference.states.items()
    }
    return Snapshot(
        signals=signals,
        alerts=alerts_by_county,
        county_scores=county_scores,
        county_composite={f: composite_score(s.values()) for f, s in county_scores.items()},
        state_scores=state_scores,
        state_composite={c: composite_score(s.values()) for c, s in state_scores.items()},
        nws_available=alerts is not None,
        usgs_available=quakes is not None,
    )


def _apply_alerts(
    reference: ReferenceData,
    alerts: list[Alert],
    signals: dict[str, dict[Hazard, LiveSignal]],
) -> dict[str, list[Alert]]:
    by_county: dict[str, list[Alert]] = {}
    for alert in alerts:
        signal = alert_signal(alert.event)
        for fips in alert.county_fips:
            if fips not in reference.counties:
                continue  # A marine zone or a whole-state code
            by_county.setdefault(fips, []).append(alert)
            if signal:
                merge_signal(signals[fips], signal)
    for county_alerts in by_county.values():
        county_alerts.sort(key=alert_importance, reverse=True)
    return by_county


def _apply_quakes(
    reference: ReferenceData,
    quakes: list[Quake],
    signals: dict[str, dict[Hazard, LiveSignal]],
) -> None:
    fips_list = list(reference.counties)
    boxes = np.array([reference.counties[f].bbox for f in fips_list])

    for quake in quakes:
        distances = distance_to_boxes_miles(boxes, quake.latitude, quake.longitude)
        for index in np.nonzero(distances <= QUAKE_RADIUS_MILES)[0]:
            score = quake_score(quake.magnitude, float(distances[index]))
            if score:
                text = f"M{quake.magnitude:.1f} earthquake {quake.place}, in the past week"
                merge_signal(signals[fips_list[index]], LiveSignal(Hazard.EARTHQUAKE, score, text))


def _population_weighted(
    reference: ReferenceData,
    county_fips: tuple[str, ...],
    county_scores: dict[str, dict[Hazard, int]],
) -> dict[Hazard, int]:
    # Where population is unknown (Puerto Rico), counties are weighted equally.
    weights = [reference.counties[f].population or 1 for f in county_fips]
    total = sum(weights)
    return {
        hazard: round(
            sum(w * county_scores[f][hazard] for w, f in zip(weights, county_fips, strict=True)) / total
        )
        for hazard in Hazard
    }
