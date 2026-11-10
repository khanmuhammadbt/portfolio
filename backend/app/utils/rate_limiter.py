import threading
import time


class RateLimiter:
    """Simple per-key rolling-window limiter; process restarts reset its quotas."""

    def __init__(self, per_minute: int):
        self.per_minute = per_minute
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        window = now - 60
        with self._lock:
            hits = [timestamp for timestamp in self._hits.get(key, []) if timestamp > window]
            if len(hits) >= self.per_minute:
                self._hits[key] = hits
                return False
            hits.append(now)
            self._hits[key] = hits
            return True
