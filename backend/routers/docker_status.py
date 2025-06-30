from fastapi import APIRouter
from services.docker_status import list_containers

router = APIRouter()

@router.get("/")
async def docker_status():
    return list_containers()
