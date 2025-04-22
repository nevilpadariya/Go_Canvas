import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Authentication config
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-only-for-development")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Database URL
URL_DATABASE = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3307/project202cmpefinal")
