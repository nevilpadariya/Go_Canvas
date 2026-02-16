import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from alphagocanvas.api.models.submission import (
    FileUploadResponse, FileInfoResponse, FileDeleteResponse,
    SubmissionResponse, SubmissionListResponse, GradeSubmissionResponse,
    SubmissionCommentResponse, GradingStatsResponse
)
from alphagocanvas.database.models import FileTable, SubmissionTable, SubmissionCommentTable


# ============== FILE UPLOAD CONFIGURATION ==============

# Upload directory (relative to project root)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'py', 'java', 'cpp', 'c', 'js', 'ts', 'html', 'css',
    'png', 'jpg', 'jpeg', 'gif', 'zip', 'rar', 'xlsx', 'xls', 'pptx', 'ppt'
}

# Max file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def ensure_upload_dir():
    """Ensure the upload directory exists"""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving extension"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_id = uuid.uuid4().hex[:12]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{timestamp}_{unique_id}.{ext}" if ext else f"{timestamp}_{unique_id}"


# ============== FILE OPERATIONS ==============

async def upload_file(
    db: Session,
    file: UploadFile,
    uploader_id: int,
    uploader_role: str,
    course_id: Optional[int] = None
) -> FileUploadResponse:
    """
    Upload a file and save metadata to database.
    
    :param db: Database session
    :param file: Uploaded file
    :param uploader_id: ID of the uploader
    :param uploader_role: Role of the uploader (faculty, student, admin)
    :param course_id: Optional course ID for context
    :return: FileUploadResponse with file details
    """
    ensure_upload_dir()
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename and save
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create file URL (relative path for now, can be updated for cloud storage)
    file_url = f"/uploads/{unique_filename}"
    
    # Save to database
    new_file = FileTable(
        Filename=unique_filename,
        Fileoriginalname=file.filename,
        Filemimetype=file.content_type,
        Filesize=len(content),
        Fileurl=file_url,
        Uploaderid=uploader_id,
        Uploaderrole=uploader_role,
        Courseid=course_id,
        Createdat=datetime.now().isoformat()
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return FileUploadResponse(
        Fileid=new_file.Fileid,
        Filename=new_file.Filename,
        Fileoriginalname=new_file.Fileoriginalname,
        Filemimetype=new_file.Filemimetype,
        Filesize=new_file.Filesize,
        Fileurl=new_file.Fileurl,
        Message="File uploaded successfully"
    )


def get_file_info(db: Session, file_id: int) -> FileInfoResponse:
    """Get file information by ID"""
    file_record = db.query(FileTable).filter(FileTable.Fileid == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileInfoResponse(
        Fileid=file_record.Fileid,
        Filename=file_record.Filename,
        Fileoriginalname=file_record.Fileoriginalname,
        Filemimetype=file_record.Filemimetype,
        Filesize=file_record.Filesize,
        Fileurl=file_record.Fileurl,
        Uploaderid=file_record.Uploaderid,
        Uploaderrole=file_record.Uploaderrole,
        Courseid=file_record.Courseid,
        Createdat=file_record.Createdat
    )


def get_file_path(db: Session, file_id: int) -> str:
    """Get the actual file path for downloading"""
    file_record = db.query(FileTable).filter(FileTable.Fileid == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(UPLOAD_DIR, file_record.Filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return file_path, file_record.Fileoriginalname, file_record.Filemimetype


def delete_file(db: Session, file_id: int, user_id: int, user_role: str) -> FileDeleteResponse:
    """Delete a file"""
    file_record = db.query(FileTable).filter(FileTable.Fileid == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permission: only uploader or faculty can delete
    if file_record.Uploaderid != user_id and user_role != 'Faculty':
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")
    
    # Delete file from disk
    file_path = os.path.join(UPLOAD_DIR, file_record.Filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return FileDeleteResponse(
        Success="File deleted successfully",
        Fileid=file_id
    )


def get_files_by_course(db: Session, course_id: int) -> List[FileInfoResponse]:
    """Get all files for a course"""
    files = db.query(FileTable).filter(FileTable.Courseid == course_id).all()
    
    return [
        FileInfoResponse(
            Fileid=f.Fileid,
            Filename=f.Filename,
            Fileoriginalname=f.Fileoriginalname,
            Filemimetype=f.Filemimetype,
            Filesize=f.Filesize,
            Fileurl=f.Fileurl,
            Uploaderid=f.Uploaderid,
            Uploaderrole=f.Uploaderrole,
            Courseid=f.Courseid,
            Createdat=f.Createdat
        )
        for f in files
    ]


# ============== SUBMISSION OPERATIONS ==============

def create_submission(
    db: Session,
    assignment_id: int,
    student_id: int,
    content: Optional[str] = None,
    file_id: Optional[int] = None
) -> SubmissionResponse:
    """Create a new assignment submission"""
    
    # Check if student already submitted
    existing = db.query(SubmissionTable).filter(
        SubmissionTable.Assignmentid == assignment_id,
        SubmissionTable.Studentid == student_id
    ).first()
    
    if existing:
        # Update existing submission
        existing.Submissioncontent = content
        existing.Submissionfileid = file_id
        existing.Submitteddate = datetime.now().isoformat()
        existing.Submissiongraded = False  # Reset grading on resubmission
        existing.Submissionscore = None
        existing.Submissionfeedback = None
        existing.Gradeddate = None
        db.commit()
        db.refresh(existing)
        submission = existing
    else:
        # Create new submission
        submission = SubmissionTable(
            Assignmentid=assignment_id,
            Studentid=student_id,
            Submissioncontent=content,
            Submissionfileid=file_id,
            Submissiongraded=False,
            Submitteddate=datetime.now().isoformat()
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
    
    # Get file info if exists
    file_info = None
    if submission.Submissionfileid:
        try:
            file_info = get_file_info(db, submission.Submissionfileid)
        except:
            pass
    
    return SubmissionResponse(
        Submissionid=submission.Submissionid,
        Assignmentid=submission.Assignmentid,
        Studentid=submission.Studentid,
        Submissioncontent=submission.Submissioncontent,
        Submissionfileid=submission.Submissionfileid,
        Fileinfo=file_info,
        Submissionscore=submission.Submissionscore,
        Submissiongraded=submission.Submissiongraded or False,
        Submissionfeedback=submission.Submissionfeedback,
        Submitteddate=submission.Submitteddate,
        Gradeddate=submission.Gradeddate
    )


def get_submission(db: Session, submission_id: int) -> SubmissionResponse:
    """Get a single submission by ID"""
    submission = db.query(SubmissionTable).filter(
        SubmissionTable.Submissionid == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Get student name
    student_query = text("""
        SELECT CONCAT(Studentfirstname, ' ', Studentlastname) as Studentname 
        FROM student WHERE Studentid = :studentid
    """)
    student = db.execute(student_query, {"studentid": submission.Studentid}).fetchone()
    student_name = student.Studentname if student else None
    
    # Get file info if exists
    file_info = None
    if submission.Submissionfileid:
        try:
            file_info = get_file_info(db, submission.Submissionfileid)
        except:
            pass
    
    return SubmissionResponse(
        Submissionid=submission.Submissionid,
        Assignmentid=submission.Assignmentid,
        Studentid=submission.Studentid,
        Studentname=student_name,
        Submissioncontent=submission.Submissioncontent,
        Submissionfileid=submission.Submissionfileid,
        Fileinfo=file_info,
        Submissionscore=submission.Submissionscore,
        Submissiongraded=submission.Submissiongraded or False,
        Submissionfeedback=submission.Submissionfeedback,
        Submitteddate=submission.Submitteddate,
        Gradeddate=submission.Gradeddate
    )


def get_submissions_by_student(db: Session, student_id: int) -> List[SubmissionResponse]:
    """Get all submissions for a specific student."""
    submissions = db.query(SubmissionTable).filter(
        SubmissionTable.Studentid == student_id
    ).order_by(SubmissionTable.Submitteddate.desc()).all()

    student_query = text("""
        SELECT CONCAT(Studentfirstname, ' ', Studentlastname) as Studentname
        FROM student WHERE Studentid = :studentid
    """)
    student = db.execute(student_query, {"studentid": student_id}).fetchone()
    student_name = student.Studentname if student else None

    response: List[SubmissionResponse] = []
    for submission in submissions:
        file_info = None
        if submission.Submissionfileid:
            try:
                file_info = get_file_info(db, submission.Submissionfileid)
            except Exception:
                file_info = None

        response.append(
            SubmissionResponse(
                Submissionid=submission.Submissionid,
                Assignmentid=submission.Assignmentid,
                Studentid=submission.Studentid,
                Studentname=student_name,
                Submissioncontent=submission.Submissioncontent,
                Submissionfileid=submission.Submissionfileid,
                Fileinfo=file_info,
                Submissionscore=submission.Submissionscore,
                Submissiongraded=submission.Submissiongraded or False,
                Submissionfeedback=submission.Submissionfeedback,
                Submitteddate=submission.Submitteddate,
                Gradeddate=submission.Gradeddate,
            )
        )

    return response


def get_submissions_by_assignment(db: Session, assignment_id: int) -> SubmissionListResponse:
    """Get all submissions for an assignment"""
    # Get assignment info
    assignment_query = text("""
        SELECT Assignmentid, Assignmentname FROM assignments WHERE Assignmentid = :assignmentid
    """)
    assignment = db.execute(assignment_query, {"assignmentid": assignment_id}).fetchone()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get all submissions with student names
    submissions_query = text("""
        SELECT 
            s.Submissionid, s.Assignmentid, s.Studentid, 
            CONCAT(st.Studentfirstname, ' ', st.Studentlastname) as Studentname,
            s.Submissioncontent, s.Submissionfileid, s.Submissionscore,
            s.Submissiongraded, s.Submissionfeedback, s.Submitteddate, s.Gradeddate
        FROM submissions s
        JOIN student st ON s.Studentid = st.Studentid
        WHERE s.Assignmentid = :assignmentid
        ORDER BY s.Submitteddate DESC
    """)
    
    submissions = db.execute(submissions_query, {"assignmentid": assignment_id}).fetchall()
    
    submission_list = []
    graded_count = 0
    
    for sub in submissions:
        # Get file info if exists
        file_info = None
        if sub.Submissionfileid:
            try:
                file_info = get_file_info(db, sub.Submissionfileid)
            except:
                pass
        
        if sub.Submissiongraded:
            graded_count += 1
        
        submission_list.append(SubmissionResponse(
            Submissionid=sub.Submissionid,
            Assignmentid=sub.Assignmentid,
            Studentid=sub.Studentid,
            Studentname=sub.Studentname,
            Submissioncontent=sub.Submissioncontent,
            Submissionfileid=sub.Submissionfileid,
            Fileinfo=file_info,
            Submissionscore=sub.Submissionscore,
            Submissiongraded=sub.Submissiongraded or False,
            Submissionfeedback=sub.Submissionfeedback,
            Submitteddate=sub.Submitteddate,
            Gradeddate=sub.Gradeddate
        ))
    
    return SubmissionListResponse(
        Assignmentid=assignment.Assignmentid,
        Assignmentname=assignment.Assignmentname,
        Totalsubmissions=len(submission_list),
        Gradedcount=graded_count,
        Submissions=submission_list
    )


def grade_submission(
    db: Session,
    submission_id: int,
    score: str,
    feedback: Optional[str] = None
) -> GradeSubmissionResponse:
    """Grade a submission"""
    submission = db.query(SubmissionTable).filter(
        SubmissionTable.Submissionid == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.Submissionscore = score
    submission.Submissionfeedback = feedback
    submission.Submissiongraded = True
    submission.Gradeddate = datetime.now().isoformat()
    
    db.commit()
    
    return GradeSubmissionResponse(
        Success="Submission graded successfully",
        Submissionid=submission_id,
        Submissionscore=score
    )


# ============== COMMENT OPERATIONS ==============

def add_submission_comment(
    db: Session,
    submission_id: int,
    content: str,
    author_id: int,
    author_role: str,
    line_number: Optional[int] = None
) -> SubmissionCommentResponse:
    """Add a comment to a submission"""
    # Verify submission exists
    submission = db.query(SubmissionTable).filter(
        SubmissionTable.Submissionid == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    comment = SubmissionCommentTable(
        Submissionid=submission_id,
        Commentcontent=content,
        Commentline=line_number,
        Authorid=author_id,
        Authorrole=author_role,
        Createdat=datetime.now().isoformat()
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return SubmissionCommentResponse(
        Commentid=comment.Commentid,
        Submissionid=comment.Submissionid,
        Commentcontent=comment.Commentcontent,
        Commentline=comment.Commentline,
        Authorid=comment.Authorid,
        Authorrole=comment.Authorrole,
        Createdat=comment.Createdat
    )


def get_submission_comments(db: Session, submission_id: int) -> List[SubmissionCommentResponse]:
    """Get all comments for a submission"""
    comments = db.query(SubmissionCommentTable).filter(
        SubmissionCommentTable.Submissionid == submission_id
    ).order_by(SubmissionCommentTable.Createdat).all()
    
    return [
        SubmissionCommentResponse(
            Commentid=c.Commentid,
            Submissionid=c.Submissionid,
            Commentcontent=c.Commentcontent,
            Commentline=c.Commentline,
            Authorid=c.Authorid,
            Authorrole=c.Authorrole,
            Createdat=c.Createdat
        )
        for c in comments
    ]


def get_grading_stats(db: Session, assignment_id: int) -> GradingStatsResponse:
    """Get grading statistics for an assignment"""
    # Get assignment info
    assignment_query = text("""
        SELECT Assignmentid, Assignmentname, Courseid FROM assignments WHERE Assignmentid = :assignmentid
    """)
    assignment = db.execute(assignment_query, {"assignmentid": assignment_id}).fetchone()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get total enrolled students
    enrolled_query = text("""
        SELECT COUNT(DISTINCT Studentid) as total FROM studentenrollment WHERE Courseid = :courseid
    """)
    enrolled = db.execute(enrolled_query, {"courseid": assignment.Courseid}).fetchone()
    total_students = enrolled.total if enrolled else 0
    
    # Get submission stats
    stats_query = text("""
        SELECT 
            COUNT(*) as submitted,
            SUM(CASE WHEN Submissiongraded = TRUE THEN 1 ELSE 0 END) as graded,
            AVG(CAST(Submissionscore AS DECIMAL(5,2))) as avg_score,
            MAX(Submissionscore) as max_score,
            MIN(Submissionscore) as min_score
        FROM submissions 
        WHERE Assignmentid = :assignmentid
    """)
    stats = db.execute(stats_query, {"assignmentid": assignment_id}).fetchone()
    
    submitted = stats.submitted if stats else 0
    graded = int(stats.graded) if stats and stats.graded else 0
    
    return GradingStatsResponse(
        Assignmentid=assignment.Assignmentid,
        Assignmentname=assignment.Assignmentname,
        Totalstudents=total_students,
        Submittedcount=submitted,
        Gradedcount=graded,
        Pendingcount=submitted - graded,
        Averagescore=float(stats.avg_score) if stats and stats.avg_score else None,
        Highestscore=stats.max_score if stats else None,
        Lowestscore=stats.min_score if stats else None
    )
