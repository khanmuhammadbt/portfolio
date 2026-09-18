"""Database models for the portfolio CMS backend."""
from __future__ import annotations

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def utcnow() -> datetime:
	return datetime.now(timezone.utc)


class AdminUser(db.Model):
	__tablename__ = "admin_users"
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(64), unique=True, nullable=False, index=True)
	password_hash = db.Column(db.String(256), nullable=False)
	created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
	updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class AuthSession(db.Model):
	__tablename__ = "auth_sessions"
	id = db.Column(db.String(64), primary_key=True)
	admin_id = db.Column(db.Integer, db.ForeignKey("admin_users.id"), nullable=True, index=True)
	csrf_token = db.Column(db.String(96), nullable=False)
	ip = db.Column(db.String(64), nullable=True)
	user_agent = db.Column(db.String(256), nullable=True)
	created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
	expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
	last_seen = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class SiteContentRow(db.Model):
	__tablename__ = "site_content"
	id = db.Column(db.Integer, primary_key=True)
	data = db.Column(db.Text, nullable=False)
	updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
	updated_by = db.Column(db.String(64), nullable=True)


class LoginAttempt(db.Model):
	__tablename__ = "login_attempts"
	id = db.Column(db.Integer, primary_key=True)
	bucket = db.Column(db.String(8), nullable=False)
	key = db.Column(db.String(128), nullable=False, index=True)
	fails = db.Column(db.Integer, default=0, nullable=False)
	locked_until = db.Column(db.DateTime(timezone=True), nullable=True)
	__table_args__ = (db.UniqueConstraint("bucket", "key", name="uq_attempt_bucket_key"),)


class AuditLog(db.Model):
	__tablename__ = "audit_log"
	id = db.Column(db.Integer, primary_key=True)
	at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
	event = db.Column(db.String(32), nullable=False)
	username = db.Column(db.String(64), nullable=True)
	ip = db.Column(db.String(64), nullable=True)
	detail = db.Column(db.String(256), nullable=True)
