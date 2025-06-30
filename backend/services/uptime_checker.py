import httpx
import time

URLS = ["https://google.com", "https://github.com"]

def check_urls():
    results = []
    for url in URLS:
        start = time.time()
        try:
            r = httpx.get(url, timeout=5)
            elapsed = round((time.time() - start) * 1000)
            results.append({
                "url": url,
                "status": r.status_code,
                "response_time_ms": elapsed
            })
        except Exception as e:
            results.append({
                "url": url,
                "status": "DOWN",
                "error": str(e)
            })
    return results
