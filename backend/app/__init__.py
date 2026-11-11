from __future__ import annotations

import json
import os

from flask import Flask, g, jsonify, request, send_from_directory
from sqlalchemy.exc import OperationalError

from .extensions import db, migrate
from .models import AdminUser, SiteContentRow
from .routes import auth_bp, chat_bp, content_bp, health_bp
from .services.auth_service import hash_password, load_session, rate_limiter
from .utils.audit import client_ip

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST_DIR = os.path.normpath(os.path.join(BASE_DIR, os.environ.get("DIST_DIR", "../frontend/dist")))


def create_app() -> Flask:
    application = Flask(__name__, static_folder=None)
    database_url = os.environ.get("DATABASE_URL")
    if database_url is None:
        if os.environ.get("VERCEL") == "1":
            raise RuntimeError("DATABASE_URL is required for Vercel deployments.")
        database_url = f"sqlite:///{os.path.join(BASE_DIR, 'cms.db')}"
    elif database_url.startswith("postgres://"):
        database_url = "postgresql+psycopg://" + database_url[len("postgres://"):]
    elif database_url.startswith("postgresql://"):
        database_url = "postgresql+psycopg://" + database_url[len("postgresql://"):]

    application.config["SQLALCHEMY_DATABASE_URI"] = database_url
    if database_url.startswith("postgresql+psycopg://"):
        application.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 1,
            "max_overflow": 0,
            "pool_timeout": 5,
        }
    application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    application.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024
    application.config["JSON_SORT_KEYS"] = False
    application.config["SECURE_COOKIE"] = os.environ.get("SECURE_COOKIE", "false").lower() == "true"

    db.init_app(application)
    migrate.init_app(application, db)
    application.register_blueprint(health_bp)
    application.register_blueprint(content_bp)
    application.register_blueprint(chat_bp)
    application.register_blueprint(auth_bp)

    @application.before_request
    def gate():
        bootstrap(application)
        if request.path.startswith("/api/") and not rate_limiter.allow(client_ip()):
            return jsonify({"code": "rate_limited", "message": "Too many requests."}), 429
        g.session = load_session()

    @application.after_request
    def harden_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; img-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "script-src 'self' 'unsafe-inline'; "
            "font-src 'self' https://fonts.gstatic.com; connect-src 'self'"
        )
        if application.config["SECURE_COOKIE"]:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @application.route("/", defaults={"path": ""})
    @application.route("/<path:path>")
    def spa(path: str):
        if path and os.path.exists(os.path.join(DIST_DIR, path)):
            return send_from_directory(DIST_DIR, path)
        return send_from_directory(DIST_DIR, "index.html")

    @application.errorhandler(413)
    def too_large(_error):
        return jsonify({"code": "too_large", "message": "Request too large."}), 413

    @application.errorhandler(OperationalError)
    def database_unavailable(error):
        application.logger.error(
            "Database operation failed (%s)", type(error).__name__
        )
        if request.path.startswith("/api/"):
            return jsonify(
                {
                    "code": "database_unavailable",
                    "message": "Database temporarily unavailable.",
                }
            ), 503
        return "Service temporarily unavailable.", 503

    @application.errorhandler(404)
    def not_found(_error):
        if request.path.startswith("/api/"):
            return jsonify({"code": "not_found", "message": "Not found."}), 404
        return send_from_directory(DIST_DIR, "index.html")

    return application


app = create_app()


def bootstrap(application: Flask) -> None:
    if application.extensions.get("portfolio_bootstrapped"):
        return
    with application.app_context():
        changed = False
        using_default_password = False
        if not AdminUser.query.first():
            username = os.environ.get("ADMIN_USERNAME", "admin")
            password = os.environ.get("ADMIN_PASSWORD", "bantech123")
            db.session.add(AdminUser(username=username, password_hash=hash_password(password)))
            changed = True
            using_default_password = password == "bantech123"

        if not SiteContentRow.query.first():
            seed_path = os.path.join(BASE_DIR, "default_content.json")
            if os.path.exists(seed_path):
                with open(seed_path, "r", encoding="utf-8") as content_file:
                    db.session.add(SiteContentRow(content_json=content_file.read()))
                    changed = True
        if changed:
            db.session.commit()
        if using_default_password:
            print("\n  WARNING: DEFAULT ADMIN PASSWORD IN USE (admin / bantech123)")
            print("     Change it from the admin panel -> Security tab, or set")
            print("     ADMIN_PASSWORD before first run.\n")
    application.extensions["portfolio_bootstrapped"] = True
