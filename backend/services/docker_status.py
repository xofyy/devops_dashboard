import docker

def list_containers():
    client = docker.from_env()
    containers = client.containers.list(all=True)
    return [{
        "name": c.name,
        "status": c.status,
        "image": c.image.tags
    } for c in containers]
