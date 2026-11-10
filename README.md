# Khan Muhammad Portfolio

Full-stack portfolio and CMS application built with React, Vite, JavaScript, and Flask. The frontend uses `.js` and `.jsx` files; TypeScript is not required.

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

## Production-style single-server run

Build the frontend first. The output is written to `frontend/dist` and served by Flask:

```powershell
cd frontend
npm run build

cd ..\backend
..\venv\Scripts\python.exe -m flask --app app db upgrade
..\venv\Scripts\python.exe app.py
```

Open `http://127.0.0.1:5000` after the server starts. The admin panel is available at `http://127.0.0.1:5000/#/admin`.

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
| `DATABASE_URL` | `sqlite:///backend/cms.db` | Database connection |
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