"""Application settings, overridable through environment variables or backend/.env."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    # Sent on every upstream request. NWS rejects requests without one.
    user_agent: str = "UCSD-Risk-Resource-NotForProfit"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    upstream_timeout_seconds: float = 15.0
    reference_data_path: Path = BACKEND_DIR / "data" / "reference.json"

    # Cache lifetimes
    feeds_ttl_seconds: int = 300  # NWS alerts and USGS recent earthquakes
    snapshot_ttl_seconds: int = 60  # Recomputed national scores
    weather_ttl_seconds: int = 1800  # Open-Meteo, per county
    gauges_ttl_seconds: int = 900  # NWPS, per county
    geocode_ttl_seconds: int = 86400  # Open-Meteo geocoding, per query

    # How long old data may be served when an upstream call fails. After this,
    # a source counts as unavailable so we never present old alerts as current.
    max_stale_seconds: int = 3600
    # After a failure, wait this long before calling that upstream again.
    failure_cooldown_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()
