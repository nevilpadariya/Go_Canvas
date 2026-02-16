"""
One-time migration script:
Convert legacy plain-text passwords in usertable to PBKDF2 hashes.
"""

from alphagocanvas.api.utils.passwords import hash_password, is_hashed_password
from alphagocanvas.database.connection import SessionLocal
from alphagocanvas.database.models import UserTable


def main() -> None:
    db = SessionLocal()
    try:
        users = db.query(UserTable).all()
        updated = 0
        for user in users:
            if user.Userpassword and not is_hashed_password(user.Userpassword):
                user.Userpassword = hash_password(user.Userpassword)
                updated += 1
        if updated:
            db.commit()
        print(f"Password hash migration completed. Updated users: {updated}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
