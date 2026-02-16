import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
IS_PRODUCTION = ENVIRONMENT in {"production", "prod"}
IS_TESTING = os.getenv("TESTING", "false").strip().lower() in {"1", "true", "yes", "y"}

# JWT Authentication config
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-only-for-development")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Database URL
URL_DATABASE = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gocanvas")

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# Email Configuration (SMTP)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@gocanvas.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Go Canvas")

# Frontend URL (for password reset links)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Password reset token expiry (in minutes)
PASSWORD_RESET_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_EXPIRE_MINUTES", "60"))

# Security options
SECURE_HEADERS = os.getenv("SECURE_HEADERS", "true").strip().lower() in {"1", "true", "yes", "y"}
ENABLE_HTTPS_REDIRECT = os.getenv("ENABLE_HTTPS_REDIRECT", "false").strip().lower() in {"1", "true", "yes", "y"}
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "*").split(",") if h.strip()]


def _validate_security_config() -> None:
    if not ALGORITHM or ALGORITHM.upper() not in {"HS256", "HS384", "HS512"}:
        raise RuntimeError("ALGORITHM must be one of HS256, HS384, HS512")

    if IS_PRODUCTION:
        if not SECRET_KEY or SECRET_KEY == "fallback-secret-key-only-for-development" or len(SECRET_KEY) < 32:
            raise RuntimeError("Production requires a strong SECRET_KEY (minimum 32 characters).")

        if not FRONTEND_URL.startswith("https://"):
            raise RuntimeError("Production requires FRONTEND_URL to use https://")

        if "*" in ALLOWED_HOSTS:
            raise RuntimeError("Production requires explicit ALLOWED_HOSTS (wildcard '*' is not allowed).")


_validate_security_config()
