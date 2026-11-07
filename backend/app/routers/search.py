from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_search_service
from app.schemas import SearchResult
from app.services.search import SearchService

router = APIRouter(tags=["search"])


@router.get(
    "/search",
    summary="Find counties by county name, city or ZIP code",
    response_model=list[SearchResult],
    response_model_exclude_none=True,
)
async def search(
    q: Annotated[str, Query(min_length=1, max_length=100)],
    service: Annotated[SearchService, Depends(get_search_service)],
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> list[SearchResult]:
    return await service.search(q, limit)
