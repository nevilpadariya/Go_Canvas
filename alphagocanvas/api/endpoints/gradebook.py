"""Gradebook API: full course gradebook with late policy and curve."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.gradebook import GradebookResponse
from alphagocanvas.api.services.gradebook_service import get_gradebook
from alphagocanvas.api.utils.auth import decode_token, is_current_user_faculty
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/gradebook", tags=["gradebook"])


@router.get("/course/{courseid}", dependencies=[Depends(is_current_user_faculty)], response_model=GradebookResponse)
async def get_course_gradebook(
    courseid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme),
    semester: Optional[str] = Query(None, description="Filter by enrollment semester"),
    apply_late_policy: bool = Query(False, description="Apply assignment late policy to scores"),
    curve_to_score: Optional[float] = Query(None, description="Scale grades so max = this value (e.g. 100)"),
):
    """Get full gradebook for a course: students x assignments with scores and status."""
    decode_token(token=token)
    return get_gradebook(
        db,
        course_id=courseid,
        semester=semester,
        apply_late_policy=apply_late_policy,
        curve_to_score=curve_to_score,
    )
