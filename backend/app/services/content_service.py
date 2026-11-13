import json
import re

from sqlalchemy import text

from ..extensions import db
from ..models.content_models import SiteContentRow
from ..utils.audit import audit


def _same_json_value(before: object, after: object) -> bool:
    if type(before) is not type(after):
        return False
    if isinstance(before, dict) and isinstance(after, dict):
        return before.keys() == after.keys() and all(
            _same_json_value(before[key], after[key]) for key in before
        )
    if isinstance(before, list) and isinstance(after, list):
        return len(before) == len(after) and all(
            _same_json_value(left, right) for left, right in zip(before, after)
        )
    return before == after


def _changed_fields(before: object, after: object, path: str = "") -> list[str]:
    if isinstance(before, dict) and isinstance(after, dict):
        fields = []
        for key in sorted(set(before) | set(after), key=str):
            safe_key = re.sub(r"[^A-Za-z0-9_-]", "_", str(key))[:48] or "_"
            field_path = f"{path}.{safe_key}" if path else safe_key
            if key not in before or key not in after:
                fields.append(field_path)
            else:
                fields.extend(_changed_fields(before[key], after[key], field_path))
        return fields
    return [path or "content"] if not _same_json_value(before, after) else []


def get_published_content() -> SiteContentRow | None:
    return SiteContentRow.query.order_by(SiteContentRow.id.desc()).first()


def save_content(
    content: dict,
    username: str | None,
    actor_id: int | None = None,
) -> SiteContentRow:
    if db.engine.dialect.name == "postgresql":
        db.session.execute(
            text("SELECT set_config('portfolio.source_function', :source, true)"),
            {"source": "app.services.content_service.save_content"},
        )

    row = get_published_content()
    try:
        previous_content = json.loads(row.content_json) if row else {}
    except json.JSONDecodeError:
        previous_content = None
    if row:
        row.content_json = json.dumps(content)
        row.updated_by = username
    else:
        row = SiteContentRow(content_json=json.dumps(content), updated_by=username)
        db.session.add(row)
    fields = _changed_fields(previous_content, content)
    field_summary = ",".join(fields) or "none"
    if len(field_summary) > 170:
        field_summary = f"{field_summary[:167]}..."
    audit(
        "content_update",
        username=username,
        actor_id=actor_id,
        detail=(
            "source=app.services.content_service.save_content; "
            f"fields={field_summary}"
        ),
    )
    db.session.commit()
    return row
