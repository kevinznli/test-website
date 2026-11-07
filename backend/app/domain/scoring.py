"""The scoring model, as pure functions with no I/O.

Every rule that decides a number is here, and /about on the frontend describes
the same 50/50 split between static baseline and live signal.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Literal

from app.domain.hazards import ALERT_RULES, Hazard

Tier = Literal["Low", "Moderate", "Elevated", "Critical"]

BASELINE_WEIGHT = 0.5
LIVE_WEIGHT = 0.5

# Lowest score for each tier, highest first. These match the frontend's hazard
# bar colours, which change at 75 and 50.
TIER_FLOORS: list[tuple[int, Tier]] = [
    (75, "Critical"),
    (50, "Elevated"),
    (30, "Moderate"),
    (0, "Low"),
]

# Earthquake thresholds from the data dictionary on /about.
QUAKE_RADIUS_MILES = 30
QUAKE_CRITICAL_RADIUS_MILES = 20
QUAKE_CRITICAL_MAGNITUDE = 5.5
QUAKE_STRONG_MAGNITUDE = 4.5
QUAKE_ADVISORY_MAGNITUDE = 3.0

# Weather thresholds from the data dictionary on /about.
FIRE_RH_LIMIT = 15
FIRE_GUST_LIMIT_MPH = 25
GUST_ADVISORY_MPH = 40
GUST_CRITICAL_MPH = 58

# NWPS flood category to live flood score. Other categories, such as
# "not_defined" or "obs_not_current", say nothing about flooding.
GAUGE_CATEGORY_SCORES = {
    "major": 100,
    "moderate": 85,
    "minor": 70,
    "action": 40,
    "no_flooding": 0,
}


@dataclass(frozen=True)
class LiveSignal:
    """One piece of live evidence for a hazard: its score and a sentence explaining it."""

    hazard: Hazard
    score: int
    text: str


def tier_for(score: int) -> Tier:
    for floor, tier in TIER_FLOORS:
        if score >= floor:
            return tier
    return "Low"


def hazard_score(baseline: int, live: int) -> int:
    return round(BASELINE_WEIGHT * baseline + LIVE_WEIGHT * live)


def composite_score(hazard_scores: Iterable[int]) -> int:
    """Combine hazard scores, weighted toward the worst.

    A plain average would let hazards that don't apply to a place, such as
    hurricanes in Nevada, hide the one that does. So this is 60% the highest
    score and 40% the mean of the top three.
    """
    top = sorted(hazard_scores, reverse=True)[:3]
    if not top:
        return 0
    return round(0.6 * top[0] + 0.4 * sum(top) / len(top))


def alert_signal(event: str) -> LiveSignal | None:
    rule = ALERT_RULES.get(event)
    if rule is None:
        return None
    hazard, score = rule
    return LiveSignal(hazard, score, f"{event} active")


def quake_score(magnitude: float, distance_miles: float) -> int:
    if distance_miles <= QUAKE_CRITICAL_RADIUS_MILES and magnitude >= QUAKE_CRITICAL_MAGNITUDE:
        return 100
    if distance_miles <= QUAKE_RADIUS_MILES:
        if magnitude >= QUAKE_STRONG_MAGNITUDE:
            return 75
        if magnitude >= QUAKE_ADVISORY_MAGNITUDE:
            return 45
    return 0


# Weather scores nothing below the advisory thresholds. The map can't include
# per-county weather, so this keeps a county's detail score equal to its map value
# except when conditions are actually hazardous.
def wildfire_weather_score(fire_advisory_hour: bool) -> int:
    """`fire_advisory_hour` means one forecast hour met both fire limits at once."""
    return 80 if fire_advisory_hour else 0


def wind_score(max_gust_mph: float) -> int:
    if max_gust_mph >= GUST_CRITICAL_MPH:
        return 100
    if max_gust_mph >= GUST_ADVISORY_MPH:
        return 70
    return 0
