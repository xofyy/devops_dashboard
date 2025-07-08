import docker
from fastapi import HTTPException
import logging
from docker.errors import DockerException
from constants import DOCKER_UNAVAILABLE_MSG, DOCKER_ERROR_STATUS, CPU_ALERT_THRESHOLD, MEM_ALERT_THRESHOLD, DEFAULT_LOG_TAIL

logger = logging.getLogger("docker_status")

def calculate_cpu_percent(stats):
    try:
        cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
        system_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"]["system_cpu_usage"]
        if system_delta > 0.0 and cpu_delta > 0.0:
            return round((cpu_delta / system_delta) * len(stats["cpu_stats"]["cpu_usage"]["percpu_usage"]) * 100.0, 2)
    except Exception:
        pass
    return 0.0

def get_ports(container):
    ports = container.attrs.get("NetworkSettings", {}).get("Ports", {})
    port_list = []
    for port, mappings in ports.items():
        if mappings:
            for m in mappings:
                host = m.get("HostIp", "")
                host_port = m.get("HostPort", "")
                port_list.append(f"{host}:{host_port}->{port}")
        else:
            port_list.append(port)
    return ", ".join(port_list) if port_list else None

def list_containers():
    try:
        client = docker.from_env()
        containers = client.containers.list()
        result = []
        for c in containers:
            stats = c.stats(stream=False)
            mem_usage = stats["memory_stats"].get("usage", 0)
            mem_limit = stats["memory_stats"].get("limit", 1)
            mem_percent = round((mem_usage / mem_limit) * 100, 2) if mem_limit else 0.0
            cpu_percent = calculate_cpu_percent(stats)
            # Ağ metricleri
            net_rx = 0
            net_tx = 0
            if "networks" in stats:
                for net in stats["networks"].values():
                    net_rx += net.get("rx_bytes", 0)
                    net_tx += net.get("tx_bytes", 0)
            # Disk I/O metricleri
            blk_read = 0
            blk_write = 0
            if "blkio_stats" in stats and "io_service_bytes_recursive" in stats["blkio_stats"]:
                for entry in stats["blkio_stats"]["io_service_bytes_recursive"]:
                    if entry.get("op") == "Read":
                        blk_read += entry.get("value", 0)
                    elif entry.get("op") == "Write":
                        blk_write += entry.get("value", 0)
            result.append({
                "id": c.id,
                "name": c.name,
                "status": c.status,
                "image": c.image.tags[0] if c.image.tags else c.image.short_id,
                "ports": get_ports(c),
                "cpu_percent": cpu_percent,
                "mem_usage": mem_usage,
                "mem_percent": mem_percent,
                "net_rx": net_rx,
                "net_tx": net_tx,
                "blk_read": blk_read,
                "blk_write": blk_write
            })
        return result
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Bilinmeyen hata: {e}")
        raise HTTPException(status_code=500, detail="Bilinmeyen bir hata oluştu.")

def get_container_logs(container_id, tail=DEFAULT_LOG_TAIL):
    try:
        client = docker.from_env()
        container = client.containers.get(container_id)
        logs = container.logs(tail=tail).decode("utf-8", errors="replace")
        return logs
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Log alınamadı: {e}")
        raise HTTPException(status_code=500, detail=f"Log alınamadı: {str(e)}")

def start_container(container_id):
    try:
        client = docker.from_env()
        container = client.containers.get(container_id)
        container.start()
        return {"success": True, "message": "Container başlatıldı."}
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Container başlatılamadı: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def stop_container(container_id):
    try:
        client = docker.from_env()
        container = client.containers.get(container_id)
        container.stop()
        return {"success": True, "message": "Container durduruldu."}
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Container durdurulamadı: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def restart_container(container_id):
    try:
        client = docker.from_env()
        container = client.containers.get(container_id)
        container.restart()
        return {"success": True, "message": "Container yeniden başlatıldı."}
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Container yeniden başlatılamadı: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_container_details(container_id):
    try:
        client = docker.from_env()
        container = client.containers.get(container_id)
        attrs = container.attrs
        return {
            "id": container.id,
            "name": container.name,
            "image": attrs.get("Config", {}).get("Image"),
            "created": attrs.get("Created"),
            "status": container.status,
            "command": attrs.get("Config", {}).get("Cmd"),
            "env": attrs.get("Config", {}).get("Env", []),
            "labels": attrs.get("Config", {}).get("Labels", {}),
            "working_dir": attrs.get("Config", {}).get("WorkingDir"),
            "entrypoint": attrs.get("Config", {}).get("Entrypoint"),
            "restart_policy": attrs.get("HostConfig", {}).get("RestartPolicy"),
            "network_mode": attrs.get("HostConfig", {}).get("NetworkMode"),
            "mounts": attrs.get("Mounts", []),
        }
    except DockerException as e:
        logger.error(f"Docker bağlantı hatası: {e}")
        raise HTTPException(status_code=DOCKER_ERROR_STATUS, detail=DOCKER_UNAVAILABLE_MSG)
    except Exception as e:
        logger.error(f"Container detayları alınamadı: {e}")
        raise HTTPException(status_code=500, detail=str(e))
