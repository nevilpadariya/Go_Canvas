"""
File and Submission API Endpoints

Provides endpoints for:
- File uploads and downloads
- Assignment submissions
- Grading workflow
- Submission comments
"""

from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.submission import (
    FileUploadResponse, FileInfoResponse, FileDeleteResponse,
    SubmissionCreateRequest, SubmissionResponse, SubmissionListResponse,
    GradeSubmissionRequest, GradeSubmissionResponse,
    SubmissionCommentRequest, SubmissionCommentResponse, CommentDeleteResponse,
    GradingStatsResponse
)
from alphagocanvas.api.services.submission_service import (
    upload_file, get_file_info, get_file_path, delete_file, get_files_by_course,
    create_submission, get_submission, get_submissions_by_assignment, get_submissions_by_student, grade_submission,
    add_submission_comment, get_submission_comments, get_grading_stats
)
from alphagocanvas.api.utils.auth import decode_token, is_current_user_faculty, is_current_user_student
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ============== FILE ROUTER ==============
file_router = APIRouter(prefix="/files", tags=["files"])


@file_router.post("/upload", response_model=FileUploadResponse)
async def upload_file_endpoint(
    db: database_dependency,
    file: UploadFile = File(...),
    courseid: Optional[int] = Form(None),
    token: str = Depends(oauth2_scheme)
):
    """
    Upload a file.
    
    - **file**: The file to upload
    - **courseid**: Optional course ID for context
    """
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    result = await upload_file(
        db=db,
        file=file,
        uploader_id=user_id,
        uploader_role=user_role,
        course_id=courseid
    )
    
    return result


@file_router.get("/{fileid}", response_model=FileInfoResponse)
async def get_file_info_endpoint(
    fileid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get file information by ID"""
    # Verify user is authenticated
    decode_token(token=token)
    return get_file_info(db, fileid)


@file_router.get("/{fileid}/download")
async def download_file_endpoint(
    fileid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Download a file by ID"""
    # Verify user is authenticated
    decode_token(token=token)
    
    file_path, original_name, mime_type = get_file_path(db, fileid)
    
    return FileResponse(
        path=file_path,
        filename=original_name,
        media_type=mime_type
    )


@file_router.delete("/{fileid}", response_model=FileDeleteResponse)
async def delete_file_endpoint(
    fileid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a file by ID"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return delete_file(db, fileid, user_id, user_role)


@file_router.get("/course/{courseid}", response_model=List[FileInfoResponse])
async def get_course_files_endpoint(
    courseid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all files for a course"""
    decode_token(token=token)
    return get_files_by_course(db, courseid)


# ============== SUBMISSION ROUTER ==============
submission_router = APIRouter(prefix="/submissions", tags=["submissions"])


@submission_router.post("/", response_model=SubmissionResponse)
async def create_submission_endpoint(
    db: database_dependency,
    assignmentid: int = Form(...),
    submissioncontent: Optional[str] = Form(None),
    submissionfile: Optional[UploadFile] = File(None),
    token: str = Depends(oauth2_scheme)
):
    """
    Create or update a submission for an assignment.
    
    - **assignmentid**: The assignment ID to submit to
    - **submissioncontent**: Optional text content
    - **submissionfile**: Optional file upload
    """
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Student":
        raise HTTPException(status_code=403, detail="Only students can submit assignments")
    
    student_id = decoded_token.get("userid")
    file_id = None
    
    # Upload file if provided
    if submissionfile and submissionfile.filename:
        file_result = await upload_file(
            db=db,
            file=submissionfile,
            uploader_id=student_id,
            uploader_role="Student"
        )
        file_id = file_result.Fileid
    
    return create_submission(
        db=db,
        assignment_id=assignmentid,
        student_id=student_id,
        content=submissioncontent,
        file_id=file_id
    )


@submission_router.get("/{submissionid}", response_model=SubmissionResponse)
async def get_submission_endpoint(
    submissionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get a submission by ID"""
    decoded_token = decode_token(token=token)
    submission = get_submission(db, submissionid)
    
    # Verify access: student can only see their own, faculty can see all
    user_role = decoded_token.get("userrole")
    user_id = decoded_token.get("userid")
    
    if user_role == "Student" and submission.Studentid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")
    
    return submission


@submission_router.get("/assignment/{assignmentid}", response_model=SubmissionListResponse)
async def get_assignment_submissions_endpoint(
    assignmentid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all submissions for an assignment (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view all submissions")
    
    return get_submissions_by_assignment(db, assignmentid)


@submission_router.get("/student/{studentid}", response_model=List[SubmissionResponse])
async def get_student_submissions_endpoint(
    studentid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all submissions for a student."""
    decoded_token = decode_token(token=token)
    requester_id = decoded_token.get("userid")
    requester_role = decoded_token.get("userrole")

    if requester_role == "Student" and requester_id != studentid:
        raise HTTPException(status_code=403, detail="Not authorized to view these submissions")

    return get_submissions_by_student(db, studentid)


# ============== GRADING ROUTER ==============
grading_router = APIRouter(prefix="/grading", tags=["grading"])


@grading_router.put("/submission/{submissionid}/grade", 
                    dependencies=[Depends(is_current_user_faculty)],
                    response_model=GradeSubmissionResponse)
async def grade_submission_endpoint(
    submissionid: int,
    request: GradeSubmissionRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Grade a submission"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can grade submissions")
    
    return grade_submission(
        db=db,
        submission_id=submissionid,
        score=request.Submissionscore,
        feedback=request.Submissionfeedback
    )


@grading_router.get("/assignment/{assignmentid}/stats",
                    dependencies=[Depends(is_current_user_faculty)],
                    response_model=GradingStatsResponse)
async def get_grading_stats_endpoint(
    assignmentid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get grading statistics for an assignment"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view grading stats")
    
    return get_grading_stats(db, assignmentid)


# ============== COMMENTS ROUTER ==============
@submission_router.post("/{submissionid}/comments", response_model=SubmissionCommentResponse)
async def add_comment_endpoint(
    submissionid: int,
    request: SubmissionCommentRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Add a comment to a submission"""
    decoded_token = decode_token(token=token)
    
    return add_submission_comment(
        db=db,
        submission_id=submissionid,
        content=request.Commentcontent,
        author_id=decoded_token.get("userid"),
        author_role=decoded_token.get("userrole"),
        line_number=request.Commentline
    )


@submission_router.get("/{submissionid}/comments", response_model=List[SubmissionCommentResponse])
async def get_comments_endpoint(
    submissionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get all comments for a submission"""
    decode_token(token=token)
    return get_submission_comments(db, submissionid)
