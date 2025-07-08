from fastapi import APIRouter
from services.uptime_checker import check_urls
from .limiter_instance import limiter
from fastapi import Request

router = APIRouter()

@router.get("/")
@limiter.limit("60/minute")
async def uptime_status(request: Request):
    return check_urls()
