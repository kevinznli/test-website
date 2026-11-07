from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path

from app.dependencies import get_risk_service
from app.schemas import StateRecord
from app.services.risk import RiskService

router = APIRouter(prefix="/states", tags=["risk"])


@router.get(
    "/{code}",
    summary="Risk details for one state",
    response_model=StateRecord,
    response_model_exclude_none=True,
)
async def get_state(
    code: Annotated[str, Path(description="Two-letter state code", min_length=2, max_length=2)],
    risk: Annotated[RiskService, Depends(get_risk_service)],
) -> StateRecord:
    record = await risk.get_state(code.upper())
    if record is None:
        raise HTTPException(status_code=404, detail=f"Unknown state code: {code}")
    return record
