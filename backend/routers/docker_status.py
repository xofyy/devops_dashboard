from fastapi import APIRouter, status
from services.docker_status import list_containers, get_container_logs, start_container, stop_container, restart_container, get_container_details

router = APIRouter()

@router.get("/")
async def docker_status():
    return list_containers()

@router.get("/{container_id}/logs")
async def container_logs(container_id: str, tail: int = 100):
    return {"logs": get_container_logs(container_id, tail)}

@router.post("/{container_id}/start", status_code=status.HTTP_200_OK)
async def start_container_api(container_id: str):
    return start_container(container_id)

@router.post("/{container_id}/stop", status_code=status.HTTP_200_OK)
async def stop_container_api(container_id: str):
    return stop_container(container_id)

@router.post("/{container_id}/restart", status_code=status.HTTP_200_OK)
async def restart_container_api(container_id: str):
    return restart_container(container_id)

@router.get("/{container_id}/details")
async def container_details(container_id: str):
    return get_container_details(container_id)
