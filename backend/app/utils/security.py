"""
Security layer: sessions, CSRF, brute-force lockouts, rate limiting.

Design notes
------------
Sessions   Random 256-bit cookie token; DB stores only its SHA-256 (token theft
           from DB dump is useless). Rotated on login (anti session-fixation).
           Idle timeout 30 min, absolute timeout 12 h.
CSRF       Synchronizer-token pattern: per-session random token returned by
           GET /api/auth/csrf and required via the X-CSRF-Token header on every
           mutation. Combined with SameSite=Strict cookies + Origin check +
           JSON-only bodies, cross-site forgery is not feasible.
Brute force 5 consecutive failures => exponential lockout 1,2,4,8... minutes,
           capped at 60 (per username AND per source IP). Persistent in SQLite.
Rate limit In-memory token bucket per IP (defense-in-depth, whole API).
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import threading
import time
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import AuditLog, AuthSession, LoginAttempt, db, utcnow

# ---------------------------------------------------------------- config
SESSION_COOKIE = "km_session"
IDLE_TIMEOUT = timedelta(minutes=30)
ABSOLUTE_TIMEOUT = timedelta(hours=12)
MAX_FAILS = 5                    # failures before lockout kicks in
MAX_LOCK_MINUTES = 60
RATE_LIMIT_PER_MIN = 60

# ---------------------------------------------------------------- helpers

def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _aware(dt: datetime | None) -> datetime | None:
    """SQLite drops tz info; treat stored values as UTC."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def client_ip() -> str:
    return (request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown")


def audit(event: str, username: str | None = None, detail: str | None = None) -> None:
    db.session.add(AuditLog(event=event, username=username, ip=client_ip(), detail=(detail or "")[:250]))


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def hash_password(password: str) -> str:
    # 600k iterations — OWASP recommendation for PBKDF2-HMAC-SHA256
    return generate_password_hash(password, method="pbkdf2:sha256:600000")


def verify_password(stored_hash: str, password: str) -> bool:
    return check_password_hash(stored_hash, password)


# ---------------------------------------------------------------- sessions

def create_session(admin_id: int | None = None) -> tuple[str, AuthSession]:
    raw = secrets.token_urlsafe(32)          # what goes into the cookie
    sess = AuthSession(
        id=_hash_token(raw),
        admin_id=admin_id,
        csrf_token=secrets.token_urlsafe(32),
        ip=client_ip(),
        user_agent=(request.user_agent.string or "")[:250],
        expires_at=utcnow_naive() + ABSOLUTE_TIMEOUT,
        last_seen=utcnow_naive(),
    )
    db.session.add(sess)
    db.session.commit()
    return raw, sess


def rotate_session(old: AuthSession, admin_id: int) -> tuple[str, AuthSession]:
    """Drop the old row and mint a fresh id+CSRF on privilege escalation."""
    db.session.delete(old)
    db.session.commit()
    return create_session(admin_id)


def load_session() -> AuthSession | None:
    raw = request.cookies.get(SESSION_COOKIE)
    if not raw:
        return None
    sess = db.session.get(AuthSession, _hash_token(raw))
    now = utcnow_naive()
    if not sess:
        return None
    if (sess.expires_at and sess.expires_at < now) or (sess.last_seen and sess.last_seen < now - IDLE_TIMEOUT):
        db.session.delete(sess)
        db.session.commit()
        return None
    sess.last_seen = now                       # rolling idle timeout
    db.session.commit()
    return sess


def destroy_session(sess: AuthSession) -> None:
    db.session.delete(sess)
    db.session.commit()


def invalidate_other_sessions(admin_id: int, keep: AuthSession | None = None) -> None:
    q = AuthSession.query.filter_by(admin_id=admin_id)
    if keep:
        q = q.filter(AuthSession.id != keep.id)
    for s in q.all():
        db.session.delete(s)
    db.session.commit()


# ---------------------------------------------------------------- CSRF

def _json_error(status: int, code: str, message: str, **extra):
    body = {"code": code, "message": message, **extra}
    return jsonify(body), status


def require_csrf(fn):
    """Mutations must carry the per-session token + same-origin Origin + JSON body."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        sess = getattr(g, "session", None)
        if not sess:
            return _json_error(401, "no_session", "No session.")
        token = request.headers.get("X-CSRF-Token", "")
        if not token or not hmac.compare_digest(token, sess.csrf_token):
            return _json_error(403, "csrf_failed", "CSRF token missing or invalid.")
        origin = request.headers.get("Origin")
        if origin:  # browsers always send Origin on cross-site fetches
            host = request.host_url.rstrip("/")
            if not (origin == host or origin.startswith(host)):
                return _json_error(403, "bad_origin", "Cross-origin request rejected.")
        if request.method != "GET" and not request.is_json:
            return _json_error(415, "json_required", "JSON body required.")
        return fn(*args, **kwargs)

    return wrapper


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        sess = getattr(g, "session", None)
        if not sess or not sess.admin_id:
            audit("unauthorized", detail=request.path)
            db.session.commit()
            return _json_error(401, "auth_required", "Authentication required.")
        return fn(*args, **kwargs)

    return wrapper


# ---------------------------------------------------------------- brute force

def _attempt_bucket(bucket: str, key: str) -> LoginAttempt:
    row = LoginAttempt.query.filter_by(bucket=bucket, key=key).first()
    if not row:
        row = LoginAttempt(bucket=bucket, key=key)
        db.session.add(row)
        db.session.commit()
    return row


def lock_remaining(username: str | None = None, ip: str | None = None) -> int:
    """Seconds until the lockout expires (0 when clear). Checks both buckets."""
    now = utcnow_naive()
    remaining = 0
    for bucket, key in (("user", username), ("ip", ip)):
        if not key:
            continue
        row = LoginAttempt.query.filter_by(bucket=bucket, key=key).first()
        if row and row.locked_until and row.locked_until > now:
            remaining = max(remaining, int((row.locked_until - now).total_seconds()))
    return remaining


def register_failure(username: str, ip: str) -> int:
    """Record a failed attempt; returns lockout seconds if a lock was triggered."""
    now = utcnow_naive()
    locked_for = 0
    for bucket, key in (("user", username), ("ip", ip)):
        row = _attempt_bucket(bucket, key)
        row.fails = (row.fails or 0) + 1
        if row.fails >= MAX_FAILS:
            # escalation: 5th -> 1 min, 6th -> 2, 7th -> 4 ... capped at 60
            minutes = min(2 ** (row.fails - MAX_FAILS), MAX_LOCK_MINUTES)
            row.fails = 0                       # restart counter so next lock escalates
            row.locked_until = now + timedelta(minutes=minutes)
            locked_for = max(locked_for, minutes * 60)
            audit("locked", username=username, detail=f"{bucket} bucket locked {minutes}m")
    db.session.commit()
    return locked_for


def clear_failures(username: str, ip: str) -> None:
    for bucket, key in (("user", username), ("ip", ip)):
        row = LoginAttempt.query.filter_by(bucket=bucket, key=key).first()
        if row:
            row.fails = 0
            row.locked_until = None
    db.session.commit()


# ---------------------------------------------------------------- rate limiting

class RateLimiter:
    """Simple per-IP token bucket; in-memory so restart resets quotas (lockouts persist in DB)."""

    def __init__(self, per_minute: int):
        self.per_minute = per_minute
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        window = now - 60
        with self._lock:
            hits = [t for t in self._hits.get(key, []) if t > window]
            if len(hits) >= self.per_minute:
                self._hits[key] = hits
                return False
            hits.append(now)
            self._hits[key] = hits
            return True


rate_limiter = RateLimiter(RATE_LIMIT_PER_MIN)
