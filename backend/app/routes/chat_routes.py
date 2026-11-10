from flask import Blueprint, jsonify, request

from ..services.chat_service import ChatUnavailable, chat_limiter, generate_reply
from ..utils.audit import client_ip
from ..utils.http import api_error

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/api/chat")
def chat():
    if not chat_limiter.allow(client_ip()):
        return api_error(429, "rate_limited", "Too many messages — please slow down.")
    if not request.is_json:
        return api_error(415, "json_required", "JSON body required.")

    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    history = data.get("history") or []
    lang = "ur" if data.get("lang") == "ur" else "en"
    if not message or len(message) > 1000:
        return api_error(400, "invalid_message", "Message must be 1-1000 characters.")
    if not isinstance(history, list):
        history = []

    try:
        return jsonify({"reply": generate_reply(message, history, lang)})
    except ChatUnavailable:
        return api_error(502, "ai_unavailable", "Assistant is momentarily unavailable.")
