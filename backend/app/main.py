"""FastAPI entry point. Run from backend/ with: uvicorn app.main:app --reload"""

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.nwps import NwpsClient
from app.clients.nws import NwsClient
from app.clients.open_meteo import OpenMeteoClient
from app.clients.usgs import UsgsClient
from app.config import get_settings
from app.core.cache import TTLCache
from app.routers import counties, health, map_values, search, states
from app.services.reference import ReferenceData
from app.services.risk import RiskService
from app.services.search import SearchService

logging.basicConfig(level=logging.INFO)
# httpx logs every request at INFO. Failed upstream calls are logged by the cache.
logging.getLogger("httpx").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    reference = ReferenceData(settings.reference_data_path)
    cache = TTLCache(settings.max_stale_seconds, settings.failure_cooldown_seconds)

    async with httpx.AsyncClient(
        headers={"User-Agent": settings.user_agent},
        timeout=settings.upstream_timeout_seconds,
        follow_redirects=True,
    ) as http:
        open_meteo = OpenMeteoClient(http)
        app.state.risk_service = RiskService(
            settings,
            cache,
            reference,
            NwsClient(http),
            UsgsClient(http),
            NwpsClient(http),
            open_meteo,
        )
        app.state.search_service = SearchService(settings, cache, reference, open_meteo)

        # Fill the cache in the background so the first visitor doesn't wait for it.
        warm_up = asyncio.create_task(app.state.risk_service.get_snapshot())
        yield
        warm_up.cancel()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Risk Resource API",
        description="US natural disaster risk scores for the Risk Resource frontend.",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    api = APIRouter(prefix="/api")
    for module in (health, states, counties, map_values, search):
        api.include_router(module.router)
    app.include_router(api)
    return app


app = create_app()
