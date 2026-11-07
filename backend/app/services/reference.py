"""Loads data/reference.json, the static data built by scripts/build_reference_data.py."""

import json
from dataclasses import dataclass
from pathlib import Path

from app.domain.hazards import Hazard


@dataclass(frozen=True)
class County:
    fips: str
    name: str  # Includes the suffix, e.g. "Riverside County"
    bare_name: str  # e.g. "Riverside"
    state_code: str
    latitude: float
    longitude: float
    bbox: tuple[float, float, float, float]  # (west, south, east, north)
    population: int | None
    baseline_scores: dict[Hazard, int]  # Percentile rank among counties, 0 to 100
    baseline_counts: dict[Hazard, int]  # Declarations, or nearby quakes for earthquake


@dataclass(frozen=True)
class State:
    code: str
    name: str
    county_fips: tuple[str, ...]
    population: int | None
    declarations: dict[Hazard, int]  # Distinct declarations statewide
    max_quake_count: int  # Highest county earthquake count in this state


class ReferenceData:
    def __init__(self, path: Path) -> None:
        raw = json.loads(path.read_text(encoding="utf-8"))
        self.meta: dict = raw["meta"]
        self.counties: dict[str, County] = {
            fips: _parse_county(fips, county) for fips, county in raw["counties"].items()
        }
        self.states: dict[str, State] = {
            code: self._build_state(code, state) for code, state in raw["states"].items()
        }

    def _build_state(self, code: str, raw: dict) -> State:
        counties = [c for c in self.counties.values() if c.state_code == code]
        populations = [c.population for c in counties if c.population is not None]
        return State(
            code=code,
            name=raw["name"],
            county_fips=tuple(c.fips for c in counties),
            population=sum(populations) if populations else None,
            declarations={Hazard(k): v for k, v in raw["declarations"].items()},
            max_quake_count=max(
                (c.baseline_counts[Hazard.EARTHQUAKE] for c in counties), default=0
            ),
        )


def _parse_county(fips: str, raw: dict) -> County:
    return County(
        fips=fips,
        name=raw["name"],
        bare_name=raw["bareName"],
        state_code=raw["state"],
        latitude=raw["lat"],
        longitude=raw["lon"],
        bbox=tuple(raw["bbox"]),
        population=raw["population"],
        baseline_scores={Hazard(k): v for k, v in raw["baseline"].items()},
        baseline_counts={Hazard(k): v for k, v in raw["counts"].items()},
    )
