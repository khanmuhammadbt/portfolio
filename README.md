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
- Admin panel: `http://127.0.0.1:5173/admin`
- Public blog: `http://127.0.0.1:5173/blog`

The frontend can also run in demo mode if the Flask API is unavailable. In that mode, editable content is stored in the browser instead of the backend database.

Blog articles are managed from the **Blog** tab in the admin panel. Add an article, fill in its title, URL slug, summary, body, and optional cover image (upload a file or paste an image URL), then mark it **Published** and publish the site changes. Drafts remain hidden from visitors; published articles are listed at `/blog` and open at `/blog/<slug>`.

## Production-style single-server run

Build the frontend first. The output is written to `frontend/dist` and served by Flask:

```powershell
cd frontend
npm run build

cd ..\backend
..\venv\Scripts\python.exe -m flask --app app db upgrade
..\venv\Scripts\python.exe app.py
```

Open `http://127.0.0.1:5000` after the server starts. The admin panel is available at `http://127.0.0.1:5000/admin`.

## Vercel multi-service deployment

The root [vercel.json](./vercel.json) configures two services: `backend` (Flask, rooted at `backend/`) and `frontend` (Vite, rooted at `frontend/`). Requests under `/api/` are routed to the backend; all other paths are routed to the frontend. The frontend already makes same-origin `/api/...` requests, so no service binding is needed.

### Neon PostgreSQL setup

1. Create a Neon project and database. In Neon, copy the **pooled** connection string for the production runtime. Keep it private; do not commit it to the repository.
2. In Vercel **Project Settings → Environment Variables**, set these for **Production**:
   - `DATABASE_URL`: the Neon pooled connection string.
   - `ADMIN_USERNAME`: the initial admin username.
   - `ADMIN_PASSWORD`: a strong, unique initial admin password.
   - `SECURE_COOKIE`: `true`.
3. Before sending traffic to the new database, apply the schema once from the repository root. Use Neon's **direct** connection string for this migration:

   ```powershell
   $env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   Push-Location backend
   ..\venv\Scripts\python.exe -m flask --app app db upgrade
   Pop-Location
   Remove-Item Env:DATABASE_URL
   ```

   The application accepts both `postgres://` and `postgresql://` URLs and uses the installed Psycopg 3 driver. Keep the pooled Neon URL set in Vercel for runtime connections; use the direct URL for schema migrations.
4. Deploy the project. Verify `/api/content` loads, then sign in to `/admin` with the initial credentials and change the password.

Vercel deployments intentionally fail fast if `DATABASE_URL` is missing. On first startup, they also require `ADMIN_PASSWORD` rather than creating the local-development default account. Local development continues to use `backend/cms.db` and its documented default credentials when no environment variables are set.

## Offline mode

The production frontend build includes a content-versioned service worker that precaches the built site and the standalone offline page, styles, game script, and icon. Its cache version changes automatically when offline assets change. The offline page uses no remote assets. When the browser fires an `offline` event, the app opens that page; the service worker also serves it for navigations that fail while offline. When an `online` event fires, the offline page automatically returns to the page that was open before the interruption.

To test offline mode, build and run the production preview (`npm run build`, then `npm run preview` from `frontend`) or run the Flask production-style server above. Open the site once while online and wait for the service worker to install. In browser DevTools, use **Network → Offline** (or disconnect the device), then reload or navigate to another page. The offline page and game should load; test jumping with Space/Arrow Up or by tapping the game, and verify the best score survives a reload. Turn networking back on to verify the site returns automatically.

Service workers require HTTPS in deployment (localhost is allowed), and the site must be hosted at the root path as configured by this project. The browser's online/offline events report network availability, which may not always guarantee that a particular server or API is reachable.

## Admin access

The default first-run credentials are:

- Username: `admin`
- Password: `bantech123`

Change the password from the admin Security tab. For a new deployment, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` before starting Flask.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Flask server port |
| `ADMIN_USERNAME` | `admin` | First-run admin username |
| `ADMIN_PASSWORD` | `bantech123` | First-run admin password |
| `DATABASE_URL` | `sqlite:///backend/cms.db` locally; required on Vercel | Database connection (Neon PostgreSQL in production) |
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