from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

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

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Go Canvas API",
    description="Learning Management System API",
    version="1.0.0"
)

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


# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files for serving uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Get allowed origins from environment variable or use defaults
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://gocanvas.vercel.app")
origins = cors_origins_str.split(",")

# For development, you might want to add localhost
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
async def root():
    return {"message": "Go Canvas API is running", "status": "ok"}


if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

