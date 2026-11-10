from flask import Blueprint, g, jsonify, request

from ..extensions import db
from ..models.auth_models import AdminUser
from ..services.auth_service import (
    SESSION_COOKIE,
    change_admin_password,
    create_session,
    login_admin,
    logout_admin,
    require_admin,
    require_csrf,
)
from ..utils.http import admin_name, api_error, set_session_cookie

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/api/auth/csrf")
def csrf():
    if g.session:
        return jsonify({"csrf_token": g.session.csrf_token})
    raw, session = create_session()
    return set_session_cookie(jsonify({"csrf_token": session.csrf_token}), raw)


@auth_bp.post("/api/auth/login")
@require_csrf
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()[:64]
    password = str(data.get("password", ""))[:256]
    if not username or not password:
        return api_error(400, "invalid_request", "Username and password required.")

    result = login_admin(username, password)
    if result.status == "locked":
        return api_error(423, "locked", "Too many failed attempts. Locked out.", retry_after=result.retry_after)
    if result.status == "invalid_credentials":
        return api_error(401, "invalid_credentials", "Invalid credentials")

    if not result.raw_token or not result.csrf_token or not result.username:
        raise RuntimeError("Successful authentication did not produce session credentials.")
    response = jsonify({"admin": {"username": result.username}, "csrf_token": result.csrf_token})
    return set_session_cookie(response, result.raw_token)


@auth_bp.post("/api/auth/logout")
@require_csrf
def logout():
    logout_admin(g.session, admin_name())
    response = jsonify({"ok": True})
    response.delete_cookie(SESSION_COOKIE, path="/")
    return response


@auth_bp.get("/api/auth/me")
def me():
    if not g.session or not g.session.admin_id:
        return api_error(401, "auth_required", "Authentication required.")
    user = db.session.get(AdminUser, g.session.admin_id)
    return jsonify({"username": user.username if user else "admin"})


@auth_bp.post("/api/auth/password")
@require_csrf
@require_admin
def change_password():
    data = request.get_json(silent=True) or {}
    current = str(data.get("current_password", ""))
    new = str(data.get("new_password", ""))
    result = change_admin_password(current, new)
    if result == "weak_password":
        return api_error(400, "weak_password", "Password must be 8+ chars with letters and digits.")
    if result == "invalid_credentials":
        return api_error(401, "invalid_credentials", "Current password is incorrect")
    return jsonify({"ok": True})
