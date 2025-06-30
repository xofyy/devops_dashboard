import psutil
import GPUtil

def get_system_status():
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
