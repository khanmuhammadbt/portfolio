from app import db
from ..utils.time import utcnow


class AdminUser(db.Model):
    __tablename__ = "admin_users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    sessions = db.relationship("AuthSession", back_populates="admin")
    audit_events = db.relationship("AuditLog", back_populates="actor")

    __table_args__ = (db.UniqueConstraint("username", name="uq_admin_users_username"),)


class AuthSession(db.Model):
    """The SHA-256 cookie-token digest is the session's primary key."""

    __tablename__ = "auth_sessions"

    id = db.Column(db.String(64), primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("admin_users.id"), nullable=True, index=True)
    csrf_token = db.Column(db.String(96), nullable=False)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    last_seen_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    admin = db.relationship("AdminUser", back_populates="sessions")


class LoginAttempt(db.Model):
    """Persistent brute-force tracking."""

    __tablename__ = "login_attempts"

    id = db.Column(db.Integer, primary_key=True)
    subject_type = db.Column(db.String(8), nullable=False)
    subject_key = db.Column(db.String(128), nullable=False)
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        db.UniqueConstraint("subject_type", "subject_key", name="uq_login_attempts_subject"),
        db.CheckConstraint("subject_type IN ('user', 'ip')", name="ck_login_attempts_subject_type"),
        db.CheckConstraint("failed_attempts >= 0", name="ck_login_attempts_failed_attempts"),
    )
