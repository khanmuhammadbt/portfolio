from app import db
from ..utils.time import utcnow


class AuditLog(db.Model):
    __tablename__ = "audit_log"

    id = db.Column(db.Integer, primary_key=True)
    occurred_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    event = db.Column(db.String(32), nullable=False)
    actor_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "admin_users.id",
            name="fk_audit_log_actor_id_admin_users",
            ondelete="SET NULL",
        ),
        nullable=True,
    )
    username = db.Column(db.String(64), nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    detail = db.Column(db.String(256), nullable=True)

    actor = db.relationship("AdminUser", back_populates="audit_events")
