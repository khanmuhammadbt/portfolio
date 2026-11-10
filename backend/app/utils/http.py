from flask import current_app, g, jsonify

from ..extensions import db
from ..models.auth_models import AdminUser
from ..services.auth_service import SESSION_COOKIE


def api_error(status: int, code: str, message: str, **extra):
    return jsonify({"code": code, "message": message, **extra}), status


def set_session_cookie(response, raw: str):
    response.set_cookie(
        SESSION_COOKIE,
        raw,
        httponly=True,
        samesite="Strict",
        secure=current_app.config["SECURE_COOKIE"],
        path="/",
    )
    return response


def admin_name() -> str | None:
    session = getattr(g, "session", None)
    if session and session.admin_id:
        user = db.session.get(AdminUser, session.admin_id)
        return user.username if user else None
    return None
