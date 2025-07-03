from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import system, uptime, docker_status

app = FastAPI(title="DevOps Dashboard API")

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(system.router, prefix="/api/system")
app.include_router(uptime.router, prefix="/api/uptime")
app.include_router(docker_status.router, prefix="/api/docker")

@app.get("/health")
def health():
    return {"status": "ok"}
