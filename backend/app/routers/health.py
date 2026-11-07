from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.dependencies import get_risk_service
from app.services.risk import RiskService

router = APIRouter(tags=["health"])


@router.get("/health", summary="Service status and the state of each upstream source")
async def health(risk: Annotated[RiskService, Depends(get_risk_service)]) -> dict[str, Any]:
    return {"status": "ok", "sources": risk.source_status()}
