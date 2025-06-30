from fastapi import APIRouter
from services.metrics import get_system_status

router = APIRouter()

@router.get("/")
async def system_status():
    return get_system_status()
