"""In-memory TTL cache that can fall back to recent data when an upstream fails.

This is a single-process cache, which is all a demo needs. It keeps upstream
usage low, because every site visitor shares this backend's API quotas.
"""

import asyncio
import logging
import time
from collections import defaultdict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# What a failed upstream call can raise: network or HTTP errors, or a response
# body that doesn't have the shape the client parses.
UPSTREAM_FAILURES = (httpx.HTTPError, ValueError, KeyError, TypeError, AttributeError)


class UpstreamUnavailable(Exception):
    """An upstream call failed and no recent enough data is cached."""


@dataclass
class _Entry:
    value: Any = None
    has_value: bool = False
    fetched_at: float = 0.0
    failed_at: float | None = None
    last_error: str | None = None


class TTLCache:
    def __init__(self, max_stale_seconds: int, failure_cooldown_seconds: int) -> None:
        self._max_stale = max_stale_seconds
        self._cooldown = failure_cooldown_seconds
        self._entries: dict[str, _Entry] = {}
        # One lock per key, so concurrent requests share a single upstream call.
        self._locks: defaultdict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

    async def get_or_fetch(
        self, key: str, fetch: Callable[[], Awaitable[Any]], ttl_seconds: int
    ) -> Any:
        """Return a cached value, calling `fetch` if it has expired.

        Raises UpstreamUnavailable if the fetch fails and nothing usable is cached.
        """
        entry = self._entries.get(key)
        if entry and entry.has_value and self._age(entry) < ttl_seconds:
            return entry.value

        async with self._locks[key]:
            entry = self._entries.setdefault(key, _Entry())
            if entry.has_value and self._age(entry) < ttl_seconds:
                return entry.value

            in_cooldown = (
                entry.failed_at is not None
                and time.monotonic() - entry.failed_at < self._cooldown
            )
            if in_cooldown:
                return self._stale_or_raise(key, entry)

            try:
                value = await fetch()
            except UPSTREAM_FAILURES as exc:
                entry.failed_at = time.monotonic()
                entry.last_error = f"{type(exc).__name__}: {exc}"
                logger.warning("Upstream fetch failed for %s: %s", key, entry.last_error)
                return self._stale_or_raise(key, entry)

            entry.value = value
            entry.has_value = True
            entry.fetched_at = time.monotonic()
            entry.failed_at = None
            entry.last_error = None
            return value

    def status(self, prefix: str) -> dict[str, Any]:
        """Summarize all cache keys starting with `prefix`, for the health endpoint."""
        entries = [e for key, e in self._entries.items() if key.startswith(prefix)]
        if not entries:
            return {"status": "not_fetched_yet"}
        ages = [self._age(e) for e in entries if e.has_value]
        errors = [e.last_error for e in entries if e.last_error]
        result: dict[str, Any] = {
            "status": "degraded" if errors else "ok",
            "ageSeconds": round(min(ages)) if ages else None,
        }
        if errors:
            result["lastError"] = errors[-1]
        return result

    def _stale_or_raise(self, key: str, entry: _Entry) -> Any:
        if entry.has_value and self._age(entry) < self._max_stale:
            return entry.value
        raise UpstreamUnavailable(key)

    @staticmethod
    def _age(entry: _Entry) -> float:
        return time.monotonic() - entry.fetched_at
