# Portfolio CMS — Flask Backend

Ye backend aapki poori portfolio website ka control room hai — admin panel isi API
se baat karta hai, aur saari site ka content SQLite database me save hota hai.

---

## 🚀 Setup (3 steps)

```bash
# 1. Frontend build
cd ../frontend
npm run build                     # frontend/dist/ folder ban jayega

# 2. Backend dependencies
cd ../backend
pip install -r requirements.txt

# 3. Run
python run.py
```

Ab `http://127.0.0.1:5000` kholein — website Flask se serve hogi.
Admin panel: **`http://127.0.0.1:5000/#/admin`**

Default login: **`admin / bantech123`** — pehle login ke baad
**Security tab** se zaroor badlein (ya `ADMIN_PASSWORD` env var set karein pehli run se pehle).

---

## 🔐 Security — jo implement hai

### 1. Password Hashing (PBKDF2-SHA256)
- `werkzeug.security.generate_password_hash(..., pbkdf2:sha256:600000)`
- **600,000 iterations** (OWASP recommended) — hash hi DB me jata hai
- Plaintext password kabhi store nahi hota, kabhi log nahi hota
- `check_password_hash` constant-time comparison (timing-attack safe)

### 2. CSRF Protection (3 layers)
- **Synchronizer token**: har session ka apna random token (`GET /api/auth/csrf`),
  har mutation par `X-CSRF-Token` header me zaroori — `hmac.compare_digest` se verify
- **SameSite=Strict cookies**: browser cross-site request me cookie bhejta hi nahi
- **Origin check + JSON-only bodies**: `Origin` header host se match karna zaroori,
  sirf `application/json` accept hota hai (HTML form se forgery impossible)

### 3. Brute-Force Protection
- **5 failed attempts → lockout**: 1 min, phir 2, 4, 8… max 60 min
  (exponential backoff — har round me double)
- Lockout **username bucket + IP bucket** dono par, SQLite me persistent
  (server restart ke baad bhi lock barkarar)
- Response: `423 Locked` + `retry_after` seconds — admin UI countdown dikhata hai
- **Rate limiting**: poore API par per-IP bucket (60 req/min) → `429`

### 4. Sessions
- Random 256-bit cookie token; DB me sirf uska **SHA-256** (DB leak se session steal nahi)
- **Rotation on login** (session-fixation protection — naya id + naya CSRF token)
- Idle timeout 30 min, absolute 12 h, HttpOnly cookie
- Password change par baqi saare devices logout

### 5. Audit Log
- Har event SQLite `audit_log` table me: login_ok / login_fail / locked /
  logout / content_update / password_change — timestamp, username, IP ke sath

### 6. Extra hardening
- Security headers: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, HSTS (HTTPS par)
- 512 KB request size cap, generic "Invalid credentials" error (user-enumeration safe)

---

## 🤖 Banta Tech Chatbot (`/api/chat`)

- Website par neumorphic chat widget — bottom-right, 24/7 branding (Karachi Time)
- **Key server-side rehti hai**: browser `POST /api/chat` ko call karta hai, backend Gemini se baat karta hai
- Roman Urdu + English dono me jawab (system prompt me Banta Tech ka poora profile, FAQs, services)
- **Chat-specific rate limit**: 15 msgs/min/IP → `429`
- Validation: 1–1000 chars, history max ~10 turns, JSON-only
- Agar Flask down ho (static hosting): frontend seedha Gemini call karta hai, aur API bhi fail ho jaye to built-in **offline FAQ brain** jawab deta hai — bot kabhi khamosh nahi

| Var | Default | Purpose |
|---|---|---|
| `CHAT_API_KEY` | (provided key) | Gemini API key — **env var preferred**, rotation recommended |
| `CHAT_MODEL` | `gemini-3.5-flash-lite` | Model name |

## ⚙️ Environment variables

| Var | Default | Purpose |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | First-run admin username |
| `ADMIN_PASSWORD` | `bantech123` | First-run password (sirf hash store hota hai) |
| `DATABASE_URL` | `sqlite:///backend/cms.db` | DB location (Postgres bhi chal sakta hai) |
| `SECURE_COOKIE` | `false` | `true` karein jab HTTPS ho (HSTS bhi on ho jata hai) |
| `PORT` | `5000` | Server port |

## 🌐 Production deployment

```bash
SECURE_COOKIE=true ADMIN_USERNAME=khan ADMIN_PASSWORD='strong-pass-123' \
  gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

Checklist: HTTPS (Let's Encrypt / Cloudflare), `SECURE_COOKIE=true`, firewall par sirf
80/443 open, `cms.db` ka regular backup.

---

## 📁 Files

| File | Role |
|---|---|
| `app/__init__.py` | Flask application, routes, SPA hosting + headers |
| `app/models/` | `AdminUser`, `AuthSession`, `SiteContentRow`, `LoginAttempt`, `AuditLog` |
| `app/utils/security.py` | Hashing, CSRF, lockout, rate limiting, session lifecycle |
| `default_content.json` | Website ka seed content (admin panel ke default ke jaisa) |

## 🔗 API

| Method | Path | Auth | Kaam |
|---|---|---|---|
| GET | `/api/health` | — | Backend alive? |
| GET | `/api/content` | — | Website content |
| PUT | `/api/content` | admin + CSRF | Content save |
| GET | `/api/auth/csrf` | — | Session + CSRF token |
| POST | `/api/auth/login` | CSRF | Login (lockout + rate-limited) |
| POST | `/api/auth/logout` | CSRF | Logout |
| GET | `/api/auth/me` | admin | Current user |
| POST | `/api/auth/password` | admin + CSRF | Password change (others logged out) |

> Note: agar Flask backend chal nahi raha, frontend **demo mode** me chalti hai —
> content `localStorage` me save hota hai aur wahan bhi lockout + SHA-256 hash check hai,
> lekin production security hamesha yahi Flask backend deta hai.
