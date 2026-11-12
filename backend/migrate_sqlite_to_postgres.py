"""Copy the current SQLite CMS database into the configured PostgreSQL database."""
from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

from flask_migrate import upgrade
from sqlalchemy import DateTime, Integer, MetaData, create_engine, func, inspect, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError

from app import app, db
from app.utils.time import as_utc

TABLES = (
    "admin_users",
    "auth_sessions",
    "login_attempts",
    "audit_log",
    "site_content",
)
BATCH_SIZE = 500
MIGRATIONS_DIR = Path(__file__).with_name("migrations")


def _read_only_sqlite_engine(path: Path) -> Engine:
    source_uri = f"{path.resolve().as_uri()}?mode=ro"
    return create_engine(
        "sqlite://",
        creator=lambda: sqlite3.connect(source_uri, uri=True),
    )


def _normalized_row(values: dict, table) -> dict:
    normalized = dict(values)
    for column in table.columns:
        value = normalized[column.name]
        if value is None or not isinstance(column.type, DateTime):
            continue
        normalized[column.name] = as_utc(value)
    return normalized


def _copy_table(source_connection, target_connection, source_table, target_table) -> int:
    primary_key = tuple(target_table.primary_key.columns)
    if len(primary_key) != 1:
        raise RuntimeError(f"Expected a single primary key for {target_table.name}.")
    key_column = primary_key[0]
    copied = 0
    result = source_connection.execution_options(stream_results=True).execute(
        select(source_table)
    )

    while rows := result.mappings().fetchmany(BATCH_SIZE):
        source_rows = [_normalized_row(dict(row), target_table) for row in rows]
        keys = [row[key_column.name] for row in source_rows]
        existing_rows = target_connection.execute(
            select(target_table).where(key_column.in_(keys))
        ).mappings()
        existing = {
            row[key_column.name]: _normalized_row(dict(row), target_table)
            for row in existing_rows
        }

        inserts = []
        for row in source_rows:
            existing_row = existing.get(row[key_column.name])
            if existing_row is not None:
                if existing_row != row:
                    raise RuntimeError(
                        f"Conflicting data already exists in target table {target_table.name}."
                    )
                continue
            inserts.append(row)

        if inserts:
            target_connection.execute(target_table.insert(), inserts)
            copied += len(inserts)

    return copied


def _reset_integer_sequences(connection) -> None:
    for table_name in TABLES:
        table = db.metadata.tables[table_name]
        primary_key = tuple(table.primary_key.columns)
        if (
            len(primary_key) != 1
            or not isinstance(primary_key[0].type, Integer)
        ):
            continue

        sequence = connection.execute(
            text("SELECT pg_get_serial_sequence(:table_name, 'id')"),
            {"table_name": table_name},
        ).scalar_one_or_none()
        if not sequence:
            continue

        sequence_parts = connection.execute(
            text(
                """
                SELECT namespace.nspname, relation.relname
                FROM pg_class AS relation
                JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
                WHERE relation.oid = CAST(:sequence_name AS regclass)
                """
            ),
            {"sequence_name": sequence},
        ).one()
        current_value = connection.execute(
            text(
                """
                SELECT last_value
                FROM pg_sequences
                WHERE schemaname = :schema_name AND sequencename = :sequence_name
                """
            ),
            {"schema_name": sequence_parts.nspname, "sequence_name": sequence_parts.relname},
        ).scalar_one_or_none()
        maximum_id = connection.execute(select(func.max(primary_key[0]))).scalar_one()
        if maximum_id is None:
            continue

        next_value = max(maximum_id, current_value or maximum_id)
        connection.execute(
            text("SELECT setval(CAST(:sequence_name AS regclass), :value, true)"),
            {"sequence_name": sequence, "value": next_value},
        )


def copy_sqlite_data(source_path: Path, target_engine: Engine) -> dict[str, int]:
    source_engine = _read_only_sqlite_engine(source_path)
    try:
        source_inspector = inspect(source_engine)
        source_tables = set(source_inspector.get_table_names())
        expected_tables = set(TABLES)
        application_tables = source_tables - {"alembic_version"}
        if application_tables != expected_tables:
            missing = expected_tables - application_tables
            unexpected = application_tables - expected_tables
            details = []
            if missing:
                details.append("missing tables")
            if unexpected:
                details.append("unexpected tables")
            raise RuntimeError(
                "SQLite source schema is not the current CMS schema ("
                + ", ".join(details)
                + ")."
            )

        target_inspector = inspect(target_engine)
        target_tables = set(target_inspector.get_table_names())
        missing_target_tables = expected_tables - target_tables
        if missing_target_tables:
            raise RuntimeError(
                "PostgreSQL schema is incomplete; run Alembic migrations before copying data."
            )

        source_metadata = MetaData()
        source_metadata.reflect(bind=source_engine, only=TABLES)
        for table_name in TABLES:
            source_columns = set(source_metadata.tables[table_name].columns.keys())
            target_columns = set(db.metadata.tables[table_name].columns.keys())
            if source_columns != target_columns:
                raise RuntimeError(
                    f"SQLite source schema does not match target table {table_name}."
                )

        counts = {}
        try:
            with source_engine.connect() as source_connection:
                with target_engine.begin() as target_connection:
                    for table_name in TABLES:
                        counts[table_name] = _copy_table(
                            source_connection,
                            target_connection,
                            source_metadata.tables[table_name],
                            db.metadata.tables[table_name],
                        )
                    if target_engine.dialect.name == "postgresql":
                        _reset_integer_sequences(target_connection)
        except IntegrityError:
            raise RuntimeError(
                "SQLite data conflicts with target constraints; no copied rows were committed."
            ) from None
        return counts
    finally:
        source_engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=Path(__file__).with_name("cms.db"),
        help="SQLite database to copy (default: backend/cms.db)",
    )
    args = parser.parse_args()
    source_path = args.source.expanduser().resolve()
    if not source_path.is_file():
        parser.error(f"SQLite source database does not exist: {source_path}")

    with app.app_context():
        if db.engine.dialect.name != "postgresql":
            parser.error("DATABASE_URL must point to PostgreSQL for this migration command.")
        upgrade(directory=str(MIGRATIONS_DIR))
        counts = copy_sqlite_data(source_path, db.engine)

    total = sum(counts.values())
    print(f"SQLite data migration complete: {total} rows copied.")
    for table_name, count in counts.items():
        print(f"  {table_name}: {count} new rows")


if __name__ == "__main__":
    main()
