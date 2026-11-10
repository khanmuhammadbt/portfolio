"""Redesign authentication and audit schema

Revision ID: c41f6a90d2b7
Revises: d88bd8d258fc
Create Date: 2026-11-10 21:48:00.000000

The login-attempt table is rebuilt, so any existing transient lockout counters are reset.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c41f6a90d2b7"
down_revision = "d88bd8d258fc"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("auth_sessions", schema=None) as batch_op:
        batch_op.alter_column(
            "ip",
            new_column_name="ip_address",
            existing_type=sa.String(length=64),
            existing_nullable=True,
        )
        batch_op.alter_column(
            "last_seen",
            new_column_name="last_seen_at",
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=False,
        )

        op.drop_table("login_attempts")
        op.create_table(
            "login_attempts",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("subject_type", sa.String(length=8), nullable=False),
            sa.Column("subject_key", sa.String(length=128), nullable=False),
            sa.Column("failed_attempts", sa.Integer(), nullable=False),
            sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "subject_type IN ('user', 'ip')",
                name="ck_login_attempts_subject_type",
            ),
            sa.CheckConstraint(
                "failed_attempts >= 0",
                name="ck_login_attempts_failed_attempts",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "subject_type",
                "subject_key",
                name="uq_login_attempts_subject",
            ),
        )

    with op.batch_alter_table("audit_log", schema=None) as batch_op:
        batch_op.alter_column(
            "at",
            new_column_name="occurred_at",
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "ip",
            new_column_name="ip_address",
            existing_type=sa.String(length=64),
            existing_nullable=True,
        )
        batch_op.add_column(sa.Column("actor_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_audit_log_actor_id_admin_users",
            "admin_users",
            ["actor_id"],
            ["id"],
            ondelete="SET NULL",
        )
    op.create_index("ix_audit_log_occurred_at", "audit_log", ["occurred_at"], unique=False)


def downgrade():
    op.drop_index("ix_audit_log_occurred_at", table_name="audit_log")
    with op.batch_alter_table("audit_log", schema=None) as batch_op:
        batch_op.drop_constraint("fk_audit_log_actor_id_admin_users", type_="foreignkey")
        batch_op.drop_column("actor_id")
        batch_op.alter_column(
            "occurred_at",
            new_column_name="at",
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "ip_address",
            new_column_name="ip",
            existing_type=sa.String(length=64),
            existing_nullable=True,
        )

    op.drop_table("login_attempts")
    op.create_table(
        "login_attempts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bucket", sa.String(length=8), nullable=False),
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("fails", sa.Integer(), nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bucket", "key", name="uq_attempt_bucket_key"),
    )
    with op.batch_alter_table("auth_sessions", schema=None) as batch_op:
        batch_op.alter_column(
            "ip_address",
            new_column_name="ip",
            existing_type=sa.String(length=64),
            existing_nullable=True,
        )
        batch_op.alter_column(
            "last_seen_at",
            new_column_name="last_seen",
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=False,
        )
