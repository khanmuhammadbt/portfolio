from app import db
from ..utils.time import utcnow


class SiteContentRow(db.Model):
    """Single-row JSON document holding the published website content."""

    __tablename__ = "site_content"

    id = db.Column(db.Integer, primary_key=True)
    content_json = db.Column("data", db.Text, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    updated_by = db.Column(db.String(64), nullable=True)
