from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path

from app.dependencies import get_risk_service
from app.schemas import CountyRecord
from app.services.risk import RiskService

router = APIRouter(prefix="/counties", tags=["risk"])


@router.get(
    "/{fips}",
    summary="Risk details for one county",
    response_model=CountyRecord,
    response_model_exclude_none=True,
)
async def get_county(
    fips: Annotated[str, Path(description="Five-digit county FIPS", pattern=r"^\d{5}$")],
    risk: Annotated[RiskService, Depends(get_risk_service)],
) -> CountyRecord:
    record = await risk.get_county(fips)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Unknown county FIPS: {fips}")
    return record
