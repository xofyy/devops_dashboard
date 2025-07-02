import docker

# Helper to calculate CPU percent from docker stats
# See: https://github.com/docker/docker-py/issues/2104

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
    client = docker.from_env()
    containers = client.containers.list()
    result = []
    for c in containers:
        stats = c.stats(stream=False)
        mem_usage = stats["memory_stats"].get("usage", 0)
        mem_limit = stats["memory_stats"].get("limit", 1)
        mem_percent = round((mem_usage / mem_limit) * 100, 2) if mem_limit else 0.0
        cpu_percent = calculate_cpu_percent(stats)
        result.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "image": c.image.tags[0] if c.image.tags else c.image.short_id,
            "ports": get_ports(c),
            "cpu_percent": cpu_percent,
            "mem_usage": mem_usage,
            "mem_percent": mem_percent
        })
    return result
