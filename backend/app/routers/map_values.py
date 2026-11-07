from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import get_risk_service
from app.schemas import MapValue
from app.services.risk import MapLevel, MapMetric, RiskService

router = APIRouter(tags=["risk"])


@router.get(
    "/map-values",
    summary="One value per state or county, for colouring the map",
    response_model=list[MapValue],
)
async def get_map_values(
    risk: Annotated[RiskService, Depends(get_risk_service)],
    level: MapLevel = MapLevel.STATE,
    metric: MapMetric = MapMetric.COMPOSITE,
) -> list[MapValue]:
    return await risk.get_map_values(level, metric)
