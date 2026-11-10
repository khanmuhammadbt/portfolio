import json
from datetime import timezone

from flask import Blueprint, g, jsonify, request

from ..services.auth_service import require_admin, require_csrf
from ..services.content_service import get_published_content, save_content
from ..utils.http import admin_name, api_error

content_bp = Blueprint("content", __name__)


@content_bp.get("/api/content")
def get_content():
    row = get_published_content()
    content = json.loads(row.content_json) if row else {}
    return jsonify({
        "content": content,
        "updated_at": row.updated_at.replace(tzinfo=timezone.utc).isoformat() if row else None,
    })


@content_bp.put("/api/content")
@require_csrf
@require_admin
def put_content():
    payload = request.get_json(silent=True) or {}
    content = payload.get("content")
    if not isinstance(content, dict):
        return api_error(400, "invalid_content", "Content must be a JSON object.")

    row = save_content(content, admin_name(), actor_id=g.session.admin_id)
    return jsonify({"ok": True, "updated_at": row.updated_at.replace(tzinfo=timezone.utc).isoformat()})
