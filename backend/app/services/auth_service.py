"""Authentication, session, CSRF, audit, and brute-force protection services."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import timedelta
from functools import wraps
from typing import Literal

from sqlalchemy import or_
from flask import g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models.auth_models import AdminUser, AuthSession, LoginAttempt
from ..utils.audit import audit, client_ip
from ..utils.rate_limiter import RateLimiter
from ..utils.time import as_utc, utcnow

SESSION_COOKIE = "km_session"
IDLE_TIMEOUT = timedelta(minutes=30)
ABSOLUTE_TIMEOUT = timedelta(hours=12)
MAX_FAILS = 5
MAX_LOCK_MINUTES = 60
rate_limiter = RateLimiter(60)


@dataclass(frozen=True)
class LoginResult:
    status: Literal["locked", "invalid_credentials", "authenticated"]
    retry_after: int = 0
    username: str | None = None
    raw_token: str | None = None
    csrf_token: str | None = None


def hash_password(password: str) -> str:
    return generate_password_hash(password, method="pbkdf2:sha256:600000")


def verify_password(stored_hash: str, password: str) -> bool:
    return check_password_hash(stored_hash, password)


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _add_session(admin_id: int | None = None) -> tuple[str, AuthSession]:
    raw = secrets.token_urlsafe(32)
    now = utcnow()
    session = AuthSession(
        id=_hash_token(raw),
        admin_id=admin_id,
        csrf_token=secrets.token_urlsafe(32),
        ip_address=client_ip(),
        user_agent=(request.user_agent.string or "")[:250],
        expires_at=now + ABSOLUTE_TIMEOUT,
        last_seen_at=now,
    )
    db.session.add(session)
    return raw, session


def create_session(admin_id: int | None = None) -> tuple[str, AuthSession]:
    raw, session = _add_session(admin_id)
    db.session.commit()
    return raw, session


def rotate_session(old: AuthSession, admin_id: int) -> tuple[str, AuthSession]:
    db.session.delete(old)
    return _add_session(admin_id)


def load_session() -> AuthSession | None:
    raw = request.cookies.get(SESSION_COOKIE)
    if not raw:
        return None
    session = db.session.get(AuthSession, _hash_token(raw))
    now = utcnow()
    if not session:
        return None
    if (session.expires_at and as_utc(session.expires_at) < now) or (
        session.last_seen_at and as_utc(session.last_seen_at) < now - IDLE_TIMEOUT
    ):
        db.session.delete(session)
        db.session.commit()
        return None
    session.last_seen_at = now
    db.session.commit()
    return session


def cleanup_inactive_sessions() -> int:
    now = utcnow()
    result = AuthSession.query.filter(
        or_(
            AuthSession.expires_at < now,
            AuthSession.last_seen_at < now - IDLE_TIMEOUT,
        )
    ).delete(synchronize_session=False)
    db.session.commit()
    return result


def destroy_session(session: AuthSession) -> None:
    db.session.delete(session)


def invalidate_other_sessions(admin_id: int, keep: AuthSession | None = None) -> None:
    query = AuthSession.query.filter_by(admin_id=admin_id)
    if keep:
        query = query.filter(AuthSession.id != keep.id)
    for session in query.all():
        db.session.delete(session)


def _json_error(status: int, code: str, message: str):
    return jsonify({"code": code, "message": message}), status


def require_csrf(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        session = getattr(g, "session", None)
        if not session:
            return _json_error(401, "no_session", "No session.")
        token = request.headers.get("X-CSRF-Token", "")
        if not token or not hmac.compare_digest(token, session.csrf_token):
            return _json_error(403, "csrf_failed", "CSRF token missing or invalid.")
        origin = request.headers.get("Origin")
        if origin:
            host = request.host_url.rstrip("/")
            if origin != host:
                return _json_error(403, "bad_origin", "Cross-origin request rejected.")
        if request.method != "GET" and not request.is_json:
            return _json_error(415, "json_required", "JSON body required.")
        return fn(*args, **kwargs)

    return wrapper


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        session = getattr(g, "session", None)
        if not session or not session.admin_id:
            audit("unauthorized", detail=request.path)
            db.session.commit()
            return _json_error(401, "auth_required", "Authentication required.")
        return fn(*args, **kwargs)

    return wrapper


def _attempt_bucket(subject_type: str, key: str) -> LoginAttempt:
    row = LoginAttempt.query.filter_by(subject_type=subject_type, subject_key=key).first()
    if not row:
        row = LoginAttempt(subject_type=subject_type, subject_key=key)
        db.session.add(row)
    return row


def lock_remaining(username: str | None = None, ip: str | None = None) -> int:
    now = utcnow()
    remaining = 0
    for subject_type, key in (("user", username), ("ip", ip)):
        if not key:
            continue
        row = LoginAttempt.query.filter_by(subject_type=subject_type, subject_key=key).first()
        if row and row.locked_until:
            locked_until = as_utc(row.locked_until)
            if locked_until > now:
                remaining = max(remaining, int((locked_until - now).total_seconds()))
    return remaining


def register_failure(username: str, ip: str) -> int:
    now = utcnow()
    locked_for = 0
    for subject_type, key in (("user", username), ("ip", ip)):
        row = _attempt_bucket(subject_type, key)
        row.failed_attempts = (row.failed_attempts or 0) + 1
        if row.failed_attempts >= MAX_FAILS:
            minutes = min(2 ** (row.failed_attempts - MAX_FAILS), MAX_LOCK_MINUTES)
            row.failed_attempts = 0
            row.locked_until = now + timedelta(minutes=minutes)
            locked_for = max(locked_for, minutes * 60)
            audit("locked", username=username, detail=f"{subject_type} bucket locked {minutes}m")
    return locked_for


def clear_failures(username: str, ip: str) -> None:
    for subject_type, key in (("user", username), ("ip", ip)):
        row = LoginAttempt.query.filter_by(subject_type=subject_type, subject_key=key).first()
        if row:
            row.failed_attempts = 0
            row.locked_until = None


def login_admin(username: str, password: str) -> LoginResult:
    ip = client_ip()
    remaining = lock_remaining(username=username, ip=ip)
    if remaining > 0:
        return LoginResult("locked", retry_after=remaining)

    user = AdminUser.query.filter_by(username=username).first()
    if not user or not verify_password(user.password_hash, password):
        locked_for = register_failure(username, ip)
        audit("login_fail", username=username)
        db.session.commit()
        if locked_for:
            return LoginResult("locked", retry_after=locked_for)
        return LoginResult("invalid_credentials")

    clear_failures(username, ip)
    current_session = getattr(g, "session", None)
    if current_session is None:
        raise RuntimeError("Login requires a CSRF-authenticated session.")
    raw_token, session = rotate_session(current_session, user.id)
    audit("login_ok", username=username, actor_id=user.id)
    db.session.commit()
    return LoginResult(
        "authenticated",
        username=user.username,
        raw_token=raw_token,
        csrf_token=session.csrf_token,
    )


def change_admin_password(current_password: str, new_password: str) -> Literal["weak_password", "invalid_credentials", "ok"]:
    strong = (
        len(new_password) >= 8
        and any(char.isalpha() for char in new_password)
        and any(char.isdigit() for char in new_password)
    )
    if not strong:
        return "weak_password"

    session = getattr(g, "session", None)
    if not session or not session.admin_id:
        raise RuntimeError("Password change requires an authenticated admin session.")
    user = db.session.get(AdminUser, session.admin_id)
    if not user or not verify_password(user.password_hash, current_password):
        audit(
            "password_change_fail",
            username=user.username if user else None,
            actor_id=user.id if user else None,
        )
        db.session.commit()
        return "invalid_credentials"

    user.password_hash = hash_password(new_password)
    invalidate_other_sessions(user.id, keep=session)
    audit("password_change", username=user.username, actor_id=user.id)
    db.session.commit()
    return "ok"


def logout_admin(session: AuthSession, username: str | None) -> None:
    audit("logout", username=username, actor_id=session.admin_id)
    destroy_session(session)
    db.session.commit()
