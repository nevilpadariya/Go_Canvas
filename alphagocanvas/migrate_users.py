from sqlalchemy import create_engine, text
from alphagocanvas.config import URL_DATABASE

# Ensure correct URL format for SQLAlchemy
database_url = URL_DATABASE
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(database_url)

def run_migrations():
    with engine.connect() as connection:
        transaction = connection.begin()
        try:
            print("Checking usertable schema...")
            
            # Add Createdat column if it does not exist
            # We use quoted identifier "Createdat" to match SQLAlchemy model which expects mixed case
            try:
                connection.execute(text('ALTER TABLE usertable ADD COLUMN "Createdat" VARCHAR(50)'))
                print('Added "Createdat" column.')
            except Exception as e:
                print(f'"Createdat" column might already exist: {e}')

            # Add Isactive column if it does not exist
            try:
                connection.execute(text('ALTER TABLE usertable ADD COLUMN "Isactive" BOOLEAN DEFAULT TRUE'))
                print('Added "Isactive" column.')
            except Exception as e:
                print(f'"Isactive" column might already exist: {e}')

            transaction.commit()
            print("Migration completed successfully.")
        except Exception as e:
            transaction.rollback()
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migrations()
