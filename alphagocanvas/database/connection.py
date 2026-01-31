from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from alphagocanvas.config import URL_DATABASE

# Parse database URL and configure connection args
# DigitalOcean requires SSL connections for managed databases
connect_args = {
    "connect_timeout": 10  # 10 second timeout for initial connection
}

# Check if SSL mode is required (DigitalOcean, Supabase production)
if "sslmode=require" in URL_DATABASE or "supabase.co" in URL_DATABASE or "ondigitalocean.com" in URL_DATABASE:
    connect_args["sslmode"] = "require"

# Support both postgres:// and postgresql:// schemes
# Some tools use postgres:// but SQLAlchemy requires postgresql://
database_url = URL_DATABASE
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Create engine with production-ready settings
ENGINE = create_engine(
    database_url,
    pool_size=5,              # Number of connections to keep open
    max_overflow=10,          # Allow up to 15 total connections (5 + 10)
    pool_pre_ping=True,       # Verify connections before using them
    pool_recycle=3600,        # Recycle connections after 1 hour
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=ENGINE)


def get_database():
    """
    :return: return the database session which is used to access the data from the database
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# database dependency
database_dependency = Annotated[Session, Depends(get_database)]

