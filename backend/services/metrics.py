import psutil
import GPUtil
from fastapi import HTTPException

def get_system_status():
    try:
        gpus = GPUtil.getGPUs()
        return {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory": dict(psutil.virtual_memory()._asdict()),
            "disk": dict(psutil.disk_usage('/')._asdict()),
            "gpu": [{
                "name": gpu.name,
                "load": gpu.load,
                "mem_used": gpu.memoryUsed,
                "mem_total": gpu.memoryTotal
            } for gpu in gpus] if gpus else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
