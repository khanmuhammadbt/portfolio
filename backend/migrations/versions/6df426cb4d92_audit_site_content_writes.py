"""Audit site content writes at the PostgreSQL boundary.

Revision ID: 6df426cb4d92
Revises: c41f6a90d2b7
Create Date: 2026-11-13
"""
from alembic import op


revision = "6df426cb4d92"
down_revision = "c41f6a90d2b7"
branch_labels = None
depends_on = None


def upgrade():
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute(
        """
        CREATE OR REPLACE FUNCTION public.audit_site_content_write()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = pg_catalog, public
        AS $function$
        DECLARE
            old_data jsonb := '{}'::jsonb;
            new_data jsonb := '{}'::jsonb;
            changed_fields text[];
            content_row_id integer;
            source_name text;
            application_name text;
            field_summary text;
            audit_detail text;
        BEGIN
            source_name := NULLIF(current_setting('portfolio.source_function', true), '');
            application_name := NULLIF(current_setting('application_name', true), '');

            IF TG_OP = 'INSERT' THEN
                content_row_id := NEW.id;
                BEGIN
                    new_data := NEW.data::jsonb;
                EXCEPTION WHEN invalid_text_representation THEN
                    changed_fields := ARRAY['data'];
                END;
                IF changed_fields IS NULL THEN
                    IF jsonb_typeof(new_data) = 'object' THEN
                        SELECT COALESCE(array_agg(field_name ORDER BY field_name), ARRAY[]::text[])
                        INTO changed_fields
                        FROM jsonb_object_keys(new_data) AS fields(field_name);
                    ELSE
                        changed_fields := ARRAY['data'];
                    END IF;
                END IF;
            ELSIF TG_OP = 'UPDATE' THEN
                content_row_id := NEW.id;
                BEGIN
                    old_data := OLD.data::jsonb;
                    new_data := NEW.data::jsonb;
                EXCEPTION WHEN invalid_text_representation THEN
                    changed_fields := ARRAY['data'];
                END;
                IF changed_fields IS NULL THEN
                    IF jsonb_typeof(old_data) = 'object'
                       AND jsonb_typeof(new_data) = 'object' THEN
                        SELECT COALESCE(array_agg(field_name ORDER BY field_name), ARRAY[]::text[])
                        INTO changed_fields
                        FROM (
                            SELECT jsonb_object_keys(old_data) AS field_name
                            UNION
                            SELECT jsonb_object_keys(new_data) AS field_name
                        ) AS fields
                        WHERE old_data -> field_name IS DISTINCT FROM new_data -> field_name;
                    ELSE
                        changed_fields := ARRAY['data'];
                    END IF;
                END IF;
                IF NEW.updated_by IS DISTINCT FROM OLD.updated_by THEN
                    changed_fields := array_append(changed_fields, 'updated_by');
                END IF;
            ELSE
                content_row_id := OLD.id;
                changed_fields := ARRAY['data'];
            END IF;

            field_summary := COALESCE(array_to_string(changed_fields, ','), 'none');
            audit_detail := format(
                'src=%s; app=%s; pid=%s; row=%s; fields=%s',
                left(COALESCE(source_name, 'unknown'), 64),
                left(COALESCE(application_name, 'unknown'), 24),
                pg_backend_pid(),
                content_row_id,
                left(field_summary, 80)
            );

            INSERT INTO public.audit_log (
                occurred_at,
                event,
                username,
                ip_address,
                detail
            ) VALUES (
                clock_timestamp(),
                'content_db_' || lower(TG_OP),
                session_user,
                inet_client_addr()::text,
                left(audit_detail, 250)
            );

            IF TG_OP = 'DELETE' THEN
                RETURN OLD;
            END IF;
            RETURN NEW;
        END;
        $function$;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_site_content_write_audit
        AFTER INSERT OR UPDATE OR DELETE ON public.site_content
        FOR EACH ROW EXECUTE FUNCTION public.audit_site_content_write()
        """
    )


def downgrade():
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute(
        "DROP TRIGGER IF EXISTS trg_site_content_write_audit ON public.site_content"
    )
    op.execute("DROP FUNCTION IF EXISTS public.audit_site_content_write()")
