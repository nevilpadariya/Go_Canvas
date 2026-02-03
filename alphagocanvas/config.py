import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
