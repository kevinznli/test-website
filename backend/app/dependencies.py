"""FastAPI dependencies. The services themselves are created in main.py at startup."""

from fastapi import Request

from app.services.risk import RiskService
from app.services.search import SearchService


def get_risk_service(request: Request) -> RiskService:
    return request.app.state.risk_service


def get_search_service(request: Request) -> SearchService:
    return request.app.state.search_service
