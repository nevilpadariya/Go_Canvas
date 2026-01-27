"""
SpeedGrader API Endpoints

Provides endpoints for:
- Efficient grading workflow
- Submission navigation
- Inline feedback
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.submission import (
    SubmissionResponse, SubmissionListResponse, GradeSubmissionRequest,
    GradeSubmissionResponse, GradingStatsResponse, SubmissionCommentRequest, SubmissionCommentResponse
)
from alphagocanvas.api.services.submission_service import (
    get_submissions_by_assignment, get_submission, grade_submission,
    add_submission_comment, get_submission_comments, get_grading_stats
)
from alphagocanvas.api.utils.auth import decode_token, is_current_user_faculty
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/speedgrader", tags=["speedgrader"])


@router.get("/assignment/{assignmentid}", 
            dependencies=[Depends(is_current_user_faculty)],
            response_model=SubmissionListResponse)
async def get_speedgrader_submissions(
    assignmentid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all submissions for an assignment in SpeedGrader format"""
    decode_token(token=token)
    return get_submissions_by_assignment(db, assignmentid)


@router.get("/assignment/{assignmentid}/stats",
            dependencies=[Depends(is_current_user_faculty)], 
            response_model=GradingStatsResponse)
async def get_speedgrader_stats(
    assignmentid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get grading statistics for SpeedGrader"""
    decode_token(token=token)
    return get_grading_stats(db, assignmentid)


@router.get("/submission/{submissionid}",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=SubmissionResponse)
async def get_speedgrader_submission(
    submissionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get a single submission for grading"""
    decode_token(token=token)
    return get_submission(db, submissionid)


@router.put("/submission/{submissionid}/grade",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=GradeSubmissionResponse)
async def speedgrader_grade(
    submissionid: int,
    request: GradeSubmissionRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Grade a submission from SpeedGrader"""
    decode_token(token=token)
    return grade_submission(db, submissionid, request.Submissionscore, request.Submissionfeedback)


@router.post("/submission/{submissionid}/comments",
             dependencies=[Depends(is_current_user_faculty)],
             response_model=SubmissionCommentResponse)
async def speedgrader_add_comment(
    submissionid: int,
    request: SubmissionCommentRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Add inline comment to submission"""
    decoded_token = decode_token(token=token)
    return add_submission_comment(
        db, submissionid, request.Commentcontent,
        decoded_token.get("userid"), decoded_token.get("userrole"),
        request.Commentline
    )


@router.get("/submission/{submissionid}/comments",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=List[SubmissionCommentResponse])
async def speedgrader_get_comments(
    submissionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all comments for a submission"""
    decode_token(token=token)
    return get_submission_comments(db, submissionid)
