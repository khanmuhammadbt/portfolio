from flask import request

from ..extensions import db
from ..models.audit_models import AuditLog


def client_ip() -> str:
    return request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown"


def audit(
    event: str,
    username: str | None = None,
    detail: str | None = None,
    actor_id: int | None = None,
) -> None:
    db.session.add(
        AuditLog(
            event=event,
            actor_id=actor_id,
            username=username,
            ip_address=client_ip(),
            detail=(detail or "")[:250],
        )
    )
