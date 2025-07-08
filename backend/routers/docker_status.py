from fastapi import APIRouter, status
from services.docker_status import list_containers, get_container_logs, start_container, stop_container, restart_container, get_container_details
from pydantic import BaseModel, Field
from fastapi import Path, Query
from .limiter_instance import limiter
from fastapi import Request

router = APIRouter()

@router.get("/")
@limiter.limit("60/minute")
async def docker_status(request: Request):
    return list_containers()

@router.get("/{container_id}/logs")
@limiter.limit("60/minute")
async def container_logs(request: Request,
    container_id: str = Path(..., regex=r"^[a-fA-F0-9]{12,64}$", description="Container ID (12-64 hex karakter)"),
    tail: int = Query(100, ge=1, le=1000, description="Kaç satır log alınacak (1-1000)")
):
    return {"logs": get_container_logs(container_id, tail)}

@router.post("/{container_id}/start", status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
async def start_container_api(request: Request,
    container_id: str = Path(..., regex=r"^[a-fA-F0-9]{12,64}$", description="Container ID (12-64 hex karakter)")
):
    return start_container(container_id)

@router.post("/{container_id}/stop", status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
async def stop_container_api(request: Request,
    container_id: str = Path(..., regex=r"^[a-fA-F0-9]{12,64}$", description="Container ID (12-64 hex karakter)")
):
    return stop_container(container_id)

@router.post("/{container_id}/restart", status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
async def restart_container_api(request: Request,
    container_id: str = Path(..., regex=r"^[a-fA-F0-9]{12,64}$", description="Container ID (12-64 hex karakter)")
):
    return restart_container(container_id)

@router.get("/{container_id}/details")
@limiter.limit("60/minute")
async def container_details(request: Request,
    container_id: str = Path(..., regex=r"^[a-fA-F0-9]{12,64}$", description="Container ID (12-64 hex karakter)")
):
    return get_container_details(container_id)
