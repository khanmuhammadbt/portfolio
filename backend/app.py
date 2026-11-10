"""Compatibility entry point for local Flask and WSGI server startup."""
import os

from app import app


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=False)
