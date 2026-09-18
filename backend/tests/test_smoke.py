"""End-to-end smoke test for the CMS backend security flows."""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(tempfile.mkdtemp(), 'test.db')}"
sys.dont_write_bytecode = True

import app as server  # noqa: E402
from app.models import LoginAttempt, db  # noqa: E402

c = server.app.test_client()
PASSED = 0


def check(name, cond):
    global PASSED
    assert cond, f"FAIL: {name}"
    PASSED += 1
    print(f"  ok - {name}")


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

r = c.post("/api/auth/login", json={"username": "admin", "password": "bantech123"})
check("login w/o CSRF header -> 403", r.status_code == 403 and r.get_json()["code"] == "csrf_failed")

bad_headers = {"X-CSRF-Token": "wrong-token"}
r = c.post("/api/auth/login", json={"username": "admin", "password": "x"}, headers=bad_headers)
check("login wrong CSRF -> 403", r.status_code == 403)

headers = {"X-CSRF-Token": token}
r = c.post("/api/auth/login", data="not-json", headers={**headers, "Content-Type": "text/plain"})
check("non-JSON body -> 415", r.status_code == 415)

# ---------- hashed password in DB ----------
with server.app.app_context():
    from app.models import AdminUser
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
r = c.get("/api/auth/me")
check("session destroyed after logout", r.status_code == 401)

# ---------- security headers ----------
r = c.get("/api/health")
h = r.headers
check("security headers", h.get("X-Frame-Options") == "DENY" and h.get("X-Content-Type-Options") == "nosniff" and "Content-Security-Policy" in h)

print(f"\nALL {PASSED} CHECKS PASSED")
