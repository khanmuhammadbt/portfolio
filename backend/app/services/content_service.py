import json

from ..extensions import db
from ..models.content_models import SiteContentRow
from ..utils.audit import audit


def get_published_content() -> SiteContentRow | None:
    return SiteContentRow.query.order_by(SiteContentRow.id.desc()).first()


def save_content(
    content: dict,
    username: str | None,
    actor_id: int | None = None,
) -> SiteContentRow:
    row = get_published_content()
    if row:
        row.content_json = json.dumps(content)
        row.updated_by = username
    else:
        row = SiteContentRow(content_json=json.dumps(content), updated_by=username)
        db.session.add(row)
    audit("content_update", username=username, actor_id=actor_id)
    db.session.commit()
    return row
