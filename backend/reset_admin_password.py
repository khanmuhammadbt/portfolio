"""Reset an existing admin password from a trusted local shell."""
from getpass import getpass

from app import app, db
from app.models.audit_models import AuditLog
from app.models.auth_models import AdminUser, AuthSession, LoginAttempt
from app.services.auth_service import hash_password


def reset_admin_password(username: str, password: str) -> bool:
    if (
        not username
        or len(username) > 64
        or len(password) < 8
        or len(password) > 256
        or not any(char.isalpha() for char in password)
        or not any(char.isdigit() for char in password)
    ):
        raise ValueError("Use a username and a password with 8-256 characters, letters, and digits.")

    with app.app_context():
        user = AdminUser.query.filter_by(username=username).first()
        if user is None:
            return False

        user.password_hash = hash_password(password)
        AuthSession.query.filter_by(admin_id=user.id).delete(synchronize_session=False)
        LoginAttempt.query.delete(synchronize_session=False)
        db.session.add(
            AuditLog(
                event="password_reset",
                username=username,
                detail="Reset via local CLI",
            )
        )
        db.session.commit()
        return True


def main() -> int:
    username = input("Admin username [admin]: ").strip() or "admin"
    password = getpass("New password (input hidden): ")
    confirmation = getpass("Confirm new password: ")
    if password != confirmation:
        print("Passwords do not match.")
        return 1

    try:
        changed = reset_admin_password(username, password)
    except ValueError as error:
        print(error)
        return 1

    if not changed:
        print(f"No admin account found for username {username!r}.")
        return 1

    print("Admin password reset. Existing sessions for this account were revoked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
