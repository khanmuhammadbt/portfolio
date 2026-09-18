# Khan Muhammad Portfolio

Full-stack portfolio and CMS application built with React, Vite, TypeScript, and Flask.

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
npm install
cd ..
```

## Development

Development uses two processes so Vite can provide fast hot reload while Flask handles the API, database, authentication, and admin functionality.

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
..\venv\Scripts\python.exe run.py
```

Backend URL: `http://127.0.0.1:5000`

Useful endpoints:

- Website: `http://127.0.0.1:5173`
- API health check: `http://127.0.0.1:5000/api/health`
- Admin panel: `http://127.0.0.1:5173/#/admin`

The frontend can also run in demo mode if the Flask API is unavailable. In that mode, editable content is stored in the browser instead of the backend database.

## Production-style single-server run

Build the frontend first. The output is written to `frontend/dist` and served by Flask:

```powershell
cd frontend
npm run build

cd ..\backend
..\venv\Scripts\python.exe run.py
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

PowerShell example:

```powershell
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_PASSWORD = "change-this-password"
.\venv\Scripts\python.exe backend\run.py
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
..\venv\Scripts\python.exe tests\test_smoke.py
```

## Project structure

```text
backend/    Flask API, authentication, database, and tests
frontend/   React/Vite application and admin interface
```