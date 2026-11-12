# Khan Muhammad Portfolio

Full-stack portfolio and CMS application built with React, Vite, JavaScript, and Flask. The public site uses a skeleton layout while its content loads and supports offline access. The frontend uses `.js` and `.jsx` files; TypeScript is not required.

## Requirements

- Node.js and npm
- Python 3.10+
- PowerShell on Windows, or an equivalent shell on other platforms

The Python virtual environment is local-only and is intentionally excluded from GitHub through `.gitignore`. Create it after cloning the repository:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

The root `.gitignore` also excludes generated build output, local databases and environment files, Vercel metadata, and Lighthouse report files.

Install frontend dependencies:

```powershell
cd frontend
npm ci
cd ..
```

## Development

This project follows Rule 2 from [project_rules.md](./project_rules.md): backend and frontend code are organized by feature, with shared code kept separate.

### 1. Start the frontend

```powershell
cd frontend
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

### 2. Start the backend

Open a second terminal from the project root:

```powershell
cd backend
..\venv\Scripts\python.exe -m flask --app app db upgrade
..\venv\Scripts\python.exe app.py
```

Backend URL: `http://127.0.0.1:5000`

Useful endpoints:

- Website: `http://127.0.0.1:5173`
- API health check: `http://127.0.0.1:5000/api/health`
- Admin panel: `http://127.0.0.1:5173/#/admin`
- Public blog: `http://127.0.0.1:5173/#/blog`

The frontend can also run in demo mode if the Flask API is unavailable. In that mode, editable content is stored in the browser instead of the backend database.

Blog articles are managed from the **Blog** tab in the admin panel. Add an article, fill in its title, URL slug, summary, body, and optional cover image (upload a file or paste an image URL), then mark it **Published** and publish the site changes. Drafts remain hidden from visitors; published articles are listed at `#/blog` and open at `#/blog/<slug>`.

## Preview the production frontend build

After building the frontend, start Vite's preview server from the `frontend` directory:

```powershell
cd frontend
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. This previews the built frontend only; it does not start the Flask backend.

## Production-style single-server run

To run the full app with Flask serving the built frontend, build it first. `npm run build` writes the output to `frontend/dist` and exits; it does not start a server:

```powershell
cd frontend
npm run build
```

Then, from a terminal at the repository root, start Flask:

```powershell
cd backend
..\venv\Scripts\python.exe -m flask --app app db upgrade
..\venv\Scripts\python.exe app.py
```

Open `http://127.0.0.1:5000` after the server starts. The admin panel is available at `http://127.0.0.1:5000/#/admin`.

## Vercel multi-service deployment

The root [vercel.json](./vercel.json) configures two services: `backend` (Flask, rooted at `backend/`, with `main:app` as its entrypoint) and `frontend` (Vite, rooted at `frontend/`). The backend entrypoint imports the Flask instance from `backend/app/__init__.py`, avoiding a name collision with the local `backend/app.py` launcher. Requests under `/api/` are routed to the backend; all other paths are routed to the frontend. The frontend already makes same-origin `/api/...` requests, so no service binding is needed.

Configure a hosted PostgreSQL database for the backend before deploying. Neon PostgreSQL through the Vercel Marketplace is supported. Set `DATABASE_URL` to Neon's pooled PostgreSQL connection string; standard `postgres://` and `postgresql://` URLs are normalized to the `psycopg` driver, and SSL is required if the URL does not already specify a secure `sslmode`. If `channel_binding` is present, use a `psycopg`-supported value: `require`, `prefer`, or `disable`. The application uses a one-connection pool per warm instance with stale-connection checks, and keeps SQLite as the local-development default. On Vercel (`VERCEL=1`), startup fails if `DATABASE_URL` is missing or points to SQLite.

To migrate the existing local database, run this from the `backend` directory with `DATABASE_URL` set to the Neon URL:

```powershell
$env:DATABASE_URL = "<Neon pooled PostgreSQL connection string>"
..\venv\Scripts\python.exe migrate_sqlite_to_postgres.py --source cms.db
```

The command upgrades the PostgreSQL schema with Alembic, then copies the SQLite admin accounts, password hashes, sessions, login-attempt state, audit history, and site content while preserving primary keys and relationships. The SQLite source is opened read-only and is never deleted or modified. Identical rows already in PostgreSQL are skipped, making reruns safe; conflicting records stop the transaction rather than overwrite target data. Run it from a machine that has the source `cms.db` and do so before serving production requests. Never deploy the SQLite database file to Vercel.

If no local records need to be migrated, create the PostgreSQL schema with:

```powershell
..\venv\Scripts\python.exe -m flask --app app db upgrade
```

Do not run schema migrations from a request handler. The first request to an empty database seeds the initial admin and default content, so migrate existing records before deploying traffic to the new database.

Set these Vercel project environment variables for the backend service (at least for Production; configure Preview separately if it also needs persistence):

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL URL from the hosted provider; use the pooler endpoint and keep its credentials in Vercel settings. `postgres://` and `postgresql://` are normalized to the `psycopg` driver, and SSL is required. |
| `ADMIN_USERNAME` | Yes, for first startup | Desired initial admin username. |
| `ADMIN_PASSWORD` | Yes, for first startup | Strong initial admin password; do not use the development default. |
| `SECURE_COOKIE` | Yes, in production | `true` to mark the authentication cookie Secure over HTTPS. |
| `CHAT_API_KEY` | Only if chat API access is enabled | Provider API key. |
| `CHAT_MODEL` | No | Optional chat model override. |

Database connection failures return a generic `503` response and log only the exception type, not the database URL or credentials. A hosted database must be provisioned and its schema migrated before the application can create sessions or issue CSRF tokens; this repository cannot verify a production connection without that database's credentials.

Expired or idle sessions are deleted when their cookie is next used. To remove inactive sessions whose clients never return, run `..\venv\Scripts\python.exe -m flask --app app cleanup-auth-sessions` from the backend directory with `DATABASE_URL` set to the target database.

## Offline mode

The production frontend build includes a content-versioned service worker that precaches the built site and the standalone offline page, styles, game script, and icon. Its cache version changes automatically when offline assets change. The offline page uses no remote assets. When the browser fires an `offline` event, the app opens that page; the service worker also serves it for navigations that fail while offline. When an `online` event fires, the offline page automatically returns to the page that was open before the interruption.

To test offline mode, build and run the production preview (`npm run build`, then `npm run preview` from `frontend`) or run the Flask production-style server above. Open the site once while online and wait for the service worker to install. In browser DevTools, use **Network → Offline** (or disconnect the device), then reload or navigate to another page. The offline page and game should load; test jumping with Space/Arrow Up or by tapping the game, and verify the best score survives a reload. Turn networking back on to verify the site returns automatically.

Service workers require HTTPS in deployment (localhost is allowed), and the site must be hosted at the root path as configured by this project. The browser's online/offline events report network availability, which may not always guarantee that a particular server or API is reachable.

## Admin access

The default first-run credentials are:

- Username: `admin`
- Password: `bantech123`

Change the password from the admin Security tab. For a new deployment, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` before starting Flask.

If you can no longer sign in, stop the Flask server and run this from the repository root to reset an existing admin account. The new password is entered without being echoed; it must contain at least 8 characters, including letters and digits. The command uses the configured `DATABASE_URL` (or the default `backend/cms.db`), revokes that account's sessions, clears login lockouts, and records the reset in the audit log:

```powershell
.\venv\Scripts\python.exe backend\reset_admin_password.py
```

Make sure `DATABASE_URL` points to the intended database before running the command.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Flask server port |
| `ADMIN_USERNAME` | `admin` | First-run admin username |
| `ADMIN_PASSWORD` | `bantech123` | First-run admin password |
| `DATABASE_URL` | Local SQLite file (when unset) | SQLAlchemy database URL; use a hosted PostgreSQL URL on Vercel |
| `SECURE_COOKIE` | `false` | Enable secure cookies when using HTTPS |
| `CHAT_API_KEY` | unset | Optional server-side chatbot API key |
| `CHAT_MODEL` | `gemini-3.5-flash-lite` | Chatbot model name |
| `DIST_DIR` | `../frontend/dist` (relative to `backend`) | Built frontend directory served by Flask |

PowerShell example:

```powershell
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_PASSWORD = "change-this-password"
.\venv\Scripts\python.exe backend\app.py
```

## Checks

Frontend build:

```powershell
cd frontend
npm run build
```

Backend smoke test:

```powershell
cd backend
..\venv\Scripts\python.exe smoke_test.py
```

Database migration after model changes:

```powershell
cd backend
..\venv\Scripts\python.exe -m flask --app app db migrate -m "Describe schema change"
..\venv\Scripts\python.exe -m flask --app app db upgrade
```

For an existing database created before migrations, stamp the initial schema
baseline once before upgrading: `db stamp 8a23b4e88314`.

## Project structure

```text
backend/
  app/
    models/
    routes/
    services/
    utils/
    __init__.py
    extensions.py
  migrations/
    versions/
  app.py
  default_content.json
  requirements.txt
  smoke_test.py

frontend/
  public/
  src/
    admin/
    components/
    features/
      auth/
      blog/
      chat/
      content/
      portfolio/
      themes/
    lib/
    store/
    utils/
    App.jsx
    index.css
    main.jsx
  index.html
  package-lock.json
  package.json
  vite.config.js
```