"""Environment-backed configuration for the Flask application."""
import os


PORT = int(os.environ.get("PORT", "5000"))
SECURE_COOKIE = os.environ.get("SECURE_COOKIE", "false").lower() == "true"