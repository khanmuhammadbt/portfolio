from flask import Blueprint, jsonify
from sqlalchemy import inspect, text

from ..extensions import db
from ..services.auth_service import require_admin
from ..utils.http import api_error

db_diagnostics_bp = Blueprint("db_diagnostics", __name__)


@db_diagnostics_bp.get("/api/admin/database-diagnostics")
@require_admin
def database_diagnostics():
    if db.engine.dialect.name != "postgresql":
        return api_error(
            503,
            "postgresql_required",
            "Database diagnostics require PostgreSQL.",
        )

    connection = db.session.connection()
    connection_info = connection.execute(
        text(
            """
            SELECT
                current_database() AS database_name,
                current_user AS database_user,
                current_schema() AS schema_name,
                current_setting('search_path') AS search_path,
                current_setting('application_name') AS application_name,
                current_setting('session_replication_role') AS session_replication_role,
                (
                    SELECT format('%I.%I', ns.nspname, content_rel.relname)
                    FROM pg_class AS content_rel
                    JOIN pg_namespace AS ns ON ns.oid = content_rel.relnamespace
                    WHERE content_rel.oid = to_regclass('site_content')
                ) AS resolved_site_content
            """
        )
    ).mappings().one()

    inspector = inspect(connection)
    if inspector.has_table("alembic_version", schema="public"):
        revisions = connection.execute(
            text(
                "SELECT version_num FROM public.alembic_version ORDER BY version_num"
            )
        ).scalars().all()
    else:
        revisions = []

    trigger = connection.execute(
        text(
            """
            SELECT
                CASE trigger_row.tgenabled
                    WHEN 'O' THEN 'origin'
                    WHEN 'A' THEN 'always'
                    WHEN 'R' THEN 'replica'
                    ELSE 'disabled'
                END AS enabled_state,
                trigger_row.tgenabled <> 'D' AS enabled,
                CASE
                    WHEN trigger_row.tgenabled = 'A' THEN true
                    WHEN trigger_row.tgenabled = 'O'
                        AND current_setting('session_replication_role') IN ('origin', 'local')
                        THEN true
                    WHEN trigger_row.tgenabled = 'R'
                        AND current_setting('session_replication_role') = 'replica'
                        THEN true
                    ELSE false
                END AS fires_for_current_session,
                owner.rolname AS function_owner
            FROM pg_trigger AS trigger_row
            JOIN pg_class AS content_rel
                ON content_rel.oid = trigger_row.tgrelid
            JOIN pg_namespace AS content_ns
                ON content_ns.oid = content_rel.relnamespace
            JOIN pg_proc AS trigger_function
                ON trigger_function.oid = trigger_row.tgfoid
            JOIN pg_roles AS owner
                ON owner.oid = trigger_function.proowner
            WHERE content_ns.nspname = 'public'
                AND content_rel.relname = 'site_content'
                AND trigger_row.tgname = 'trg_site_content_write_audit'
                AND NOT trigger_row.tgisinternal
            """
        )
    ).mappings().one_or_none()

    audit_log = connection.execute(
        text(
            """
            SELECT
                relation.relrowsecurity AS rls_enabled,
                relation.relforcerowsecurity AS rls_forced
            FROM pg_class AS relation
            JOIN pg_namespace AS ns ON ns.oid = relation.relnamespace
            WHERE ns.nspname = 'public'
                AND relation.relname = 'audit_log'
            """
        )
    ).mappings().one_or_none()

    return jsonify(
        {
            "connection": dict(connection_info),
            "alembic_current_revisions": revisions,
            "site_content_trigger": dict(trigger) if trigger else None,
            "audit_log_rls": dict(audit_log) if audit_log else None,
        }
    )
