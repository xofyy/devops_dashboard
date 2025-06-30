from fastapi import APIRouter
from services.uptime_checker import check_urls

router = APIRouter()

@router.get("/")
async def uptime_status():
    return check_urls()
