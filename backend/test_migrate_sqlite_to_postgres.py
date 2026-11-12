import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, func, select
from sqlalchemy.engine import URL

from app import db
from migrate_sqlite_to_postgres import copy_sqlite_data


class SQLiteDataMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        root = Path(self.temp_dir.name)
        self.source_engine = create_engine(
            URL.create("sqlite", database=str(root / "source.db"))
        )
        self.target_engine = create_engine(
            URL.create("sqlite", database=str(root / "target.db"))
        )
        db.metadata.create_all(self.source_engine)
        db.metadata.create_all(self.target_engine)
        self._seed_source()

    def tearDown(self):
        self.source_engine.dispose()
        self.target_engine.dispose()
        self.temp_dir.cleanup()

    def _seed_source(self):
        created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
        with self.source_engine.begin() as connection:
            connection.execute(
                db.metadata.tables["admin_users"].insert(),
                {
                    "id": 7,
                    "username": "migration-test",
                    "password_hash": "pbkdf2:sha256:example-hash",
                    "created_at": created_at,
                    "updated_at": created_at,
                },
            )
            connection.execute(
                db.metadata.tables["auth_sessions"].insert(),
                {
                    "id": "a" * 64,
                    "admin_id": 7,
                    "csrf_token": "preserved-csrf-token",
                    "ip_address": "127.0.0.1",
                    "user_agent": "migration test",
                    "created_at": created_at,
                    "expires_at": datetime(2026, 1, 1, 12, tzinfo=timezone.utc),
                    "last_seen_at": created_at,
                },
            )
            connection.execute(
                db.metadata.tables["login_attempts"].insert(),
                {
                    "id": 9,
                    "subject_type": "user",
                    "subject_key": "migration-test",
                    "failed_attempts": 2,
                    "locked_until": None,
                },
            )
            connection.execute(
                db.metadata.tables["audit_log"].insert(),
                {
                    "id": 11,
                    "occurred_at": created_at,
                    "event": "migration_test",
                    "actor_id": 7,
                    "username": "migration-test",
                    "ip_address": "127.0.0.1",
                    "detail": "preserve foreign key",
                },
            )
            connection.execute(
                db.metadata.tables["site_content"].insert(),
                {
                    "id": 13,
                    "data": '{"preserve":true}',
                    "updated_at": created_at,
                    "updated_by": "migration-test",
                },
            )

    def test_copy_preserves_records_and_can_be_repeated(self):
        source_path = Path(self.temp_dir.name) / "source.db"
        copied = copy_sqlite_data(source_path, self.target_engine)
        self.assertEqual(set(copied.values()), {1})

        repeated = copy_sqlite_data(source_path, self.target_engine)
        self.assertEqual(set(repeated.values()), {0})

        with self.target_engine.connect() as connection:
            admin = connection.execute(
                select(db.metadata.tables["admin_users"])
            ).mappings().one()
            session = connection.execute(
                select(db.metadata.tables["auth_sessions"])
            ).mappings().one()
            audit = connection.execute(
                select(db.metadata.tables["audit_log"])
            ).mappings().one()
            content = connection.execute(
                select(db.metadata.tables["site_content"])
            ).mappings().one()
            self.assertEqual(admin["id"], 7)
            self.assertEqual(admin["password_hash"], "pbkdf2:sha256:example-hash")
            self.assertEqual(session["csrf_token"], "preserved-csrf-token")
            self.assertEqual(audit["actor_id"], 7)
            self.assertEqual(content["data"], '{"preserve":true}')

    def test_conflict_rolls_back_all_copied_rows(self):
        with self.target_engine.begin() as connection:
            connection.execute(
                db.metadata.tables["site_content"].insert(),
                {
                    "id": 13,
                    "data": '{"different":true}',
                    "updated_at": datetime(2026, 1, 1, tzinfo=timezone.utc),
                    "updated_by": "target",
                },
            )

        with self.assertRaisesRegex(RuntimeError, "Conflicting data"):
            copy_sqlite_data(
                Path(self.temp_dir.name) / "source.db",
                self.target_engine,
            )

        with self.target_engine.connect() as connection:
            admin_count = connection.execute(
                select(func.count()).select_from(db.metadata.tables["admin_users"])
            ).scalar_one()
        self.assertEqual(admin_count, 0)


if __name__ == "__main__":
    unittest.main()
