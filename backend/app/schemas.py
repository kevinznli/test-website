"""API response models.

These mirror frontend/lib/types.ts, and JSON field names are camelCase to match
it. If you change one side, change the other.
"""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.domain.scoring import Tier


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class HazardItem(ApiModel):
    name: str
    score: int = Field(ge=0, le=100)
    tier: Tier
    warning: str


class StateRecord(ApiModel):
    code: str
    name: str
    composite_score: int = Field(ge=0, le=100)
    tier: Tier
    counties_count: int
    population: str  # Preformatted, e.g. "39,501,350"
    active_alert_count: int | None = None  # Omitted when the NWS feed is unavailable
    primary_alert: str | None = None  # Omitted when there are no active alerts
    hazards: list[HazardItem]  # Highest score first


class CountyRecord(ApiModel):
    name: str  # Includes the suffix, e.g. "Riverside County"
    state: str  # Full state name, e.g. "California"
    state_code: str  # Two letters, e.g. "CA"
    composite_score: int = Field(ge=0, le=100)
    tier: Tier
    fips: str  # Five characters with leading zero, e.g. "06065"
    pop: str  # Preformatted, e.g. "2,458,395"
    active_alert: str | None = None  # Omitted when there are no active alerts
    hazards: list[HazardItem]  # Highest score first


class MapValue(ApiModel):
    """One map polygon's value."""

    id: str  # State code or FIPS, matching the frontend's GeoJSON feature ID
    value: int = Field(ge=0, le=100)
    tier: Tier


class SearchResult(ApiModel):
    """One search match."""

    fips: str
    name: str
    state: str
    state_code: str
    matched_place: str | None = None  # Set when a city or ZIP led to this county
