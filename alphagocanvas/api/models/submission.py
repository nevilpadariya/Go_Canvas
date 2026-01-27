from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


# ============== FILE MODELS ==============

class FileUploadResponse(BaseModel):
    """Response after successful file upload"""
    Fileid: int
    Filename: str
    Fileoriginalname: str
    Filemimetype: Optional[str]
    Filesize: int
    Fileurl: str
    Message: str = "File uploaded successfully"


class FileInfoResponse(BaseModel):
    """File information response"""
    Fileid: int
    Filename: str
    Fileoriginalname: str
    Filemimetype: Optional[str]
    Filesize: int
    Fileurl: str
    Uploaderid: int
    Uploaderrole: str
    Courseid: Optional[int]
    Createdat: str


class FileDeleteResponse(BaseModel):
    """Response after file deletion"""
    Success: str
    Fileid: int


# ============== SUBMISSION MODELS ==============

class SubmissionCreateRequest(BaseModel):
    """Request to create a new submission"""
    Assignmentid: int
    Submissioncontent: Optional[str] = None
    Submissionfileid: Optional[int] = None


class SubmissionResponse(BaseModel):
    """Submission response model"""
    Submissionid: int
    Assignmentid: int
    Studentid: int
    Studentname: Optional[str] = None
    Submissioncontent: Optional[str]
    Submissionfileid: Optional[int]
    Fileinfo: Optional[FileInfoResponse] = None
    Submissionscore: Optional[str]
    Submissiongraded: bool
    Submissionfeedback: Optional[str]
    Submitteddate: str
    Gradeddate: Optional[str]


class SubmissionListResponse(BaseModel):
    """List of submissions for an assignment"""
    Assignmentid: int
    Assignmentname: str
    Totalsubmissions: int
    Gradedcount: int
    Submissions: List[SubmissionResponse]


class GradeSubmissionRequest(BaseModel):
    """Request to grade a submission"""
    Submissionscore: str
    Submissionfeedback: Optional[str] = None


class GradeSubmissionResponse(BaseModel):
    """Response after grading"""
    Success: str
    Submissionid: int
    Submissionscore: str


# ============== SUBMISSION COMMENT MODELS ==============

class SubmissionCommentRequest(BaseModel):
    """Request to add a comment to a submission"""
    Commentcontent: str
    Commentline: Optional[int] = None  # For inline comments


class SubmissionCommentResponse(BaseModel):
    """Comment response model"""
    Commentid: int
    Submissionid: int
    Commentcontent: str
    Commentline: Optional[int]
    Authorid: int
    Authorrole: str
    Authorname: Optional[str] = None
    Createdat: str


class CommentDeleteResponse(BaseModel):
    """Response after deleting a comment"""
    Success: str
    Commentid: int


# ============== GRADING STATISTICS ==============

class GradingStatsResponse(BaseModel):
    """Statistics for assignment grading"""
    Assignmentid: int
    Assignmentname: str
    Totalstudents: int
    Submittedcount: int
    Gradedcount: int
    Pendingcount: int
    Averagescore: Optional[float]
    Highestscore: Optional[str]
    Lowestscore: Optional[str]
