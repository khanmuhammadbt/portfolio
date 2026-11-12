"""End-to-end smoke test for the CMS backend security flows (run: python smoke_test.py)."""
import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(tempfile.mkdtemp(), 'test.db')}"
sys.dont_write_bytecode = True

import app as server  # noqa: E402
from app.extensions import db  # noqa: E402
from app.services.auth_service import cleanup_inactive_sessions  # noqa: E402
from flask_migrate import downgrade, upgrade  # noqa: E402
from app.models.auth_models import AdminUser, AuthSession, LoginAttempt  # noqa: E402
from app.models.audit_models import AuditLog  # noqa: E402
from reset_admin_password import reset_admin_password  # noqa: E402
from sqlalchemy.exc import OperationalError  # noqa: E402
from sqlalchemy.engine import make_url  # noqa: E402

with server.app.app_context():
    upgrade()
    downgrade(revision="8a23b4e88314")
    upgrade()

c = server.app.test_client()
PASSED = 0


def check(name, cond):
    global PASSED
    assert cond, f"FAIL: {name}"
    PASSED += 1
    print(f"  ok - {name}")


def fail_with_database_error():
    raise OperationalError("SELECT 1", {}, RuntimeError("sensitive-detail"))


server.app.add_url_rule(
    "/api/test-db-failure",
    "test_db_failure",
    fail_with_database_error,
)

with patch.dict(os.environ, {"VERCEL": "1"}):
    os.environ.pop("DATABASE_URL", None)
    try:
        server.create_app()
        missing_vercel_database_url = False
    except RuntimeError as error:
        missing_vercel_database_url = "DATABASE_URL" in str(error)
check("Vercel requires a hosted database URL", missing_vercel_database_url)

with patch.dict(os.environ, {}):
    os.environ.pop("DATABASE_URL", None)
    os.environ.pop("VERCEL", None)
    local_app = server.create_app()
check(
    "local development defaults to SQLite",
    local_app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite:///"),
)

with patch.dict(os.environ, {"DATABASE_URL": "postgres://user:pass@db.example/app"}):
    postgres_app = server.create_app()
check(
    "PostgreSQL URL normalized to psycopg",
    make_url(postgres_app.config["SQLALCHEMY_DATABASE_URI"]).drivername == "postgresql+psycopg",
)
check(
    "PostgreSQL serverless pool is bounded",
    postgres_app.config["SQLALCHEMY_ENGINE_OPTIONS"]["pool_size"] == 1
    and postgres_app.config["SQLALCHEMY_ENGINE_OPTIONS"]["max_overflow"] == 0,
)
with patch.dict(
    os.environ,
    {"DATABASE_URL": "postgresql://test:test@db.example/app?sslmode=prefer"},
):
    ssl_app = server.create_app()
    ssl_url = make_url(ssl_app.config["SQLALCHEMY_DATABASE_URI"])
check(
    "PostgreSQL URLs use psycopg and require SSL",
    ssl_url.drivername == "postgresql+psycopg"
    and ssl_url.query["sslmode"] == "require",
)

with patch.dict(
    os.environ,
    {"VERCEL": "1", "DATABASE_URL": "sqlite:///local.db"},
):
    try:
        server.create_app()
        vercel_rejects_sqlite = False
    except RuntimeError as error:
        vercel_rejects_sqlite = "PostgreSQL" in str(error)
check("Vercel rejects SQLite DATABASE_URL", vercel_rejects_sqlite)


# ---------- health + content seed ----------
r = c.get("/api/health")
check("health 200", r.status_code == 200)
r = c.get("/api/content")
check("content seeded", r.status_code == 200 and r.get_json()["content"]["brand"]["name"] == "Khan Muhammad")

# ---------- CSRF gate ----------
r = c.put("/api/content", json={"content": {}})
check("mutation without session -> 401", r.status_code == 401)

r = c.get("/api/auth/csrf")
check("csrf issued", r.status_code == 200 and len(r.get_json()["csrf_token"]) > 20)
token = r.get_json()["csrf_token"]
with server.app.app_context():
    csrf_session = AuthSession.query.filter_by(csrf_token=token).one()
    csrf_session_id = csrf_session.id
    initial_last_seen = csrf_session.last_seen_at
    check("CSRF session created in database", csrf_session.admin_id is None)

r = c.get("/api/auth/me")
check("anonymous session remains readable", r.status_code == 401)
with server.app.app_context():
    csrf_session = db.session.get(AuthSession, csrf_session_id)
    check(
        "session read and updated across requests",
        csrf_session is not None and csrf_session.last_seen_at >= initial_last_seen,
    )

r = c.post("/api/auth/login", json={"username": "admin", "password": "bantech123"})
check("login w/o CSRF header -> 403", r.status_code == 403 and r.get_json()["code"] == "csrf_failed")

bad_headers = {"X-CSRF-Token": "wrong-token"}
r = c.post("/api/auth/login", json={"username": "admin", "password": "x"}, headers=bad_headers)
check("login wrong CSRF -> 403", r.status_code == 403)

headers = {"X-CSRF-Token": token}
bad_origin = "http://localhost.evil"
r = c.post(
    "/api/auth/login",
    json={"username": "admin", "password": "x"},
    headers={**headers, "Origin": bad_origin},
)
check("CSRF rejects a host-prefix origin spoof", r.status_code == 403 and r.get_json()["code"] == "bad_origin")
r = c.post("/api/auth/login", data="not-json", headers={**headers, "Content-Type": "text/plain"})
check("non-JSON body -> 415", r.status_code == 415)

# ---------- hashed password in DB ----------
with server.app.app_context():
    u = AdminUser.query.filter_by(username="admin").first()
    check("password stored as pbkdf2 hash", u and u.password_hash.startswith("pbkdf2:sha256:"))

# ---------- brute force lockout ----------
for i in range(4):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers=headers)
    check(f"bad login #{i+1} -> 401 generic", r.status_code == 401 and r.get_json()["code"] == "invalid_credentials")

r = c.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers=headers)
body = r.get_json()
check("5th bad login -> 423 locked", r.status_code == 423 and body.get("retry_after", 0) >= 59)

r = c.post("/api/auth/login", json={"username": "admin", "password": "bantech123"}, headers=headers)
check("valid creds still blocked during lockout", r.status_code == 423)

# clear lockout, then valid login works
with server.app.app_context():
    LoginAttempt.query.delete()
    db.session.commit()

r = c.post("/api/auth/login", json={"username": "admin", "password": "bantech123"}, headers=headers)
body = r.get_json()
check("valid login -> 200", r.status_code == 200)
check("CSRF rotated on login", body["csrf_token"] != token and len(body["csrf_token"]) > 20)
with server.app.app_context():
    check("login replaces anonymous session", db.session.get(AuthSession, csrf_session_id) is None)
    admin_user = AdminUser.query.filter_by(username="admin").one()
    authenticated_session = AuthSession.query.filter_by(admin_id=admin_user.id).one()
    authenticated_session_id = authenticated_session.id
    login_event = AuditLog.query.filter_by(event="login_ok").order_by(AuditLog.id.desc()).first()
    check(
        "login audit linked to admin",
        login_event is not None
        and login_event.actor is not None
        and login_event.actor.username == "admin",
    )
token2 = body["csrf_token"]
headers2 = {"X-CSRF-Token": token2}

r = c.get("/api/auth/me")
check("session persists (me)", r.status_code == 200 and r.get_json()["username"] == "admin")

# ---------- content write with auth + csrf ----------
new_content = r = c.get("/api/content").get_json()["content"]
new_content["hero"]["firstName"] = "TESTED"
r = c.put("/api/content", json={"content": new_content}, headers={"X-CSRF-Token": token})
check("old CSRF token rejected after rotation", r.status_code == 403)

r = c.put("/api/content", json={"content": new_content}, headers=headers2)
check("content update -> 200", r.status_code == 200)
r = c.get("/api/content")
check("content updated in DB", r.get_json()["content"]["hero"]["firstName"] == "TESTED")

# ---------- password change flow ----------
r = c.post("/api/auth/password", json={"current_password": "bantech123", "new_password": "weak"}, headers=headers2)
check("weak password rejected", r.status_code == 400)
r = c.post("/api/auth/password", json={"current_password": "WRONG", "new_password": "Str0ngPass"}, headers=headers2)
check("wrong current rejected", r.status_code == 401)
r = c.post("/api/auth/password", json={"current_password": "bantech123", "new_password": "Str0ngPass"}, headers=headers2)
check("password changed", r.status_code == 200)

r = c.post("/api/auth/login", json={"username": "admin", "password": "Str0ngPass"}, headers=headers2)
check("login with new password", r.status_code == 200)
token3 = r.get_json()["csrf_token"]

# ---------- logout ----------
r = c.post("/api/auth/logout", json={}, headers={"X-CSRF-Token": token3})
check("logout", r.status_code == 200)
with server.app.app_context():
    check("logout deletes persistent session", db.session.get(AuthSession, authenticated_session_id) is None)
r = c.get("/api/auth/me")
check("session destroyed after logout", r.status_code == 401)

# ---------- local password reset ----------
check("local reset rejects unknown admin", not reset_admin_password("missing", "NewPass123"))
try:
    reset_admin_password("admin", "weak")
    weak_password_rejected = False
except ValueError:
    weak_password_rejected = True
check("local reset rejects weak password", weak_password_rejected)
with server.app.app_context():
    db.session.add(
        LoginAttempt(subject_type="ip", subject_key="127.0.0.1", failed_attempts=3)
    )
    db.session.commit()
check("local reset updates existing admin", reset_admin_password("admin", "ResetPass123"))
with server.app.app_context():
    user = AdminUser.query.filter_by(username="admin").first()
    check("reset password stored as hash", user and user.password_hash.startswith("pbkdf2:sha256:"))
    check("reset recorded in audit log", AuditLog.query.filter_by(event="password_reset").count() == 1)
    check("reset clears login lockouts", LoginAttempt.query.count() == 0)

r = c.get("/api/auth/csrf")
reset_token = r.get_json()["csrf_token"]
r = c.post(
    "/api/auth/login",
    json={"username": "admin", "password": "ResetPass123"},
    headers={"X-CSRF-Token": reset_token},
)
check("login succeeds with reset password", r.status_code == 200)
check("local reset revokes existing sessions", reset_admin_password("admin", "NextPass456"))
with server.app.app_context():
    check("reset removed admin sessions", AuthSession.query.filter_by(admin_id=user.id).count() == 0)

# ---------- expired session handling and cleanup ----------
for expiration_kind in ("absolute", "idle"):
    expired_client = server.app.test_client()
    csrf_response = expired_client.get("/api/auth/csrf")
    csrf_value = csrf_response.get_json()["csrf_token"]
    with server.app.app_context():
        session = AuthSession.query.filter_by(csrf_token=csrf_value).one()
        expired_session_id = session.id
        now = datetime.now(timezone.utc)
        if expiration_kind == "absolute":
            session.expires_at = now - timedelta(seconds=1)
        else:
            session.expires_at = now + timedelta(hours=1)
            session.last_seen_at = now - timedelta(minutes=31)
        db.session.commit()
    r = expired_client.get("/api/auth/me")
    check(f"{expiration_kind} session expires", r.status_code == 401)
    with server.app.app_context():
        check(
            f"{expiration_kind} session is deleted on access",
            db.session.get(AuthSession, expired_session_id) is None,
        )

with server.app.app_context():
    now = datetime.now(timezone.utc)
    db.session.add_all(
        [
            AuthSession(
                id="e" * 64,
                csrf_token="expired-token",
                expires_at=now - timedelta(seconds=1),
                last_seen_at=now,
            ),
            AuthSession(
                id="f" * 64,
                csrf_token="idle-token",
                expires_at=now + timedelta(hours=1),
                last_seen_at=now - timedelta(minutes=31),
            ),
            AuthSession(
                id="b" * 64,
                csrf_token="active-token",
                expires_at=now + timedelta(hours=1),
                last_seen_at=now,
            ),
        ]
    )
    db.session.commit()
    cleaned_sessions = cleanup_inactive_sessions()
    check("session cleanup removes only expired and idle sessions", cleaned_sessions == 2)

# ---------- safe database failure response ----------
r = c.get("/api/test-db-failure")
check(
    "database error response is generic",
    r.status_code == 503
    and r.get_json()["code"] == "database_unavailable"
    and "sensitive-detail" not in r.get_data(as_text=True),
)

# ---------- security headers ----------
r = c.get("/api/health")
h = r.headers
check("security headers", h.get("X-Frame-Options") == "DENY" and h.get("X-Content-Type-Options") == "nosniff" and "Content-Security-Policy" in h)
check("CSP allows the configured Google Fonts stylesheet", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com" in h.get("Content-Security-Policy", ""))

print(f"\nALL {PASSED} CHECKS PASSED")
