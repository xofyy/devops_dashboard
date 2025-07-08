from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import system, uptime, docker_status
import os
from routers.limiter_instance import limiter
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
import docker
from docker.errors import DockerException

app = FastAPI(title="DevOps Dashboard API")

# CORS for frontend access
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(system.router, prefix="/api/system")
app.include_router(uptime.router, prefix="/api/uptime")
app.include_router(docker_status.router, prefix="/api/docker")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/docker/health")
def docker_health():
    try:
        client = docker.from_env()
        client.ping()
        return {"status": "ok", "docker": True}
    except DockerException:
        return {"status": "unavailable", "docker": False}
