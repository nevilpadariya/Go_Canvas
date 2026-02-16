from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from dotenv import load_dotenv
from starlette.middleware.trustedhost import TrustedHostMiddleware

from alphagocanvas.api.endpoints.admin import router as admin_router
from alphagocanvas.api.endpoints.authentication import router as auth_router
from alphagocanvas.api.endpoints.faculty import router as faculty_router
from alphagocanvas.api.endpoints.student import router as student_router
from alphagocanvas.api.endpoints.files import file_router, submission_router, grading_router
from alphagocanvas.api.endpoints.modules import router as modules_router
from alphagocanvas.api.endpoints.discussions import router as discussions_router
from alphagocanvas.api.endpoints.calendar import router as calendar_router
from alphagocanvas.api.endpoints.messages import router as messages_router
from alphagocanvas.api.endpoints.speedgrader import router as speedgrader_router
from alphagocanvas.api.endpoints.quiz import router as quiz_router
from alphagocanvas.api.endpoints.gradebook import router as gradebook_router
from alphagocanvas.api.endpoints.pages import router as pages_router
from alphagocanvas.config import (
    ALLOWED_HOSTS,
    ENABLE_HTTPS_REDIRECT,
    FRONTEND_URL,
    IS_PRODUCTION,
    IS_TESTING,
    SECURE_HEADERS,
)
from alphagocanvas.database.connection import ENGINE
from alphagocanvas.database.models import Base

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Go Canvas API",
    description="Learning Management System API",
    version="1.0.0"
)

logger = logging.getLogger("gocanvas")

# Include all routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(file_router)
app.include_router(submission_router)
app.include_router(grading_router)
app.include_router(modules_router)
app.include_router(discussions_router)
app.include_router(calendar_router)
app.include_router(messages_router)
app.include_router(speedgrader_router)
app.include_router(quiz_router)
app.include_router(gradebook_router)
app.include_router(pages_router)


# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files for serving uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Get allowed origins from environment variable or fallback to configured frontend URL
cors_origins_str = os.getenv("CORS_ORIGINS", FRONTEND_URL)
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if ENABLE_HTTPS_REDIRECT and not IS_TESTING:
    app.add_middleware(HTTPSRedirectMiddleware)

if ALLOWED_HOSTS and "*" not in ALLOWED_HOSTS and not IS_TESTING:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    if SECURE_HEADERS:
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        if IS_PRODUCTION:
            response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    return response

AUTO_INIT_DB = os.getenv("AUTO_INIT_DB", "false").lower() in {"1", "true", "yes", "y"}

if AUTO_INIT_DB:
    @app.on_event("startup")
    def _auto_init_db() -> None:
        try:
            Base.metadata.create_all(bind=ENGINE)
            logger.info("AUTO_INIT_DB enabled: database tables ensured.")
        except Exception:
            logger.exception("AUTO_INIT_DB failed: could not create tables.")


@app.get("/")
async def root():
    return {"message": "Go Canvas API is running", "status": "ok"}


if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
