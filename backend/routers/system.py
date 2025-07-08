from fastapi import APIRouter
from services.metrics import get_system_status
from .limiter_instance import limiter
from fastapi import Request

router = APIRouter()

@router.get("/")
@limiter.limit("60/minute")
async def system_status(request: Request):
    return get_system_status()
