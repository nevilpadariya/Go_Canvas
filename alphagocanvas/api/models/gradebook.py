"""Gradebook API models for Canvas-style full gradebook view."""
from typing import List, Optional
from pydantic import BaseModel


class GradebookCell(BaseModel):
    """One cell: student's score/status for one assignment."""
    Assignmentid: int
    Assignmentname: str
    Points_possible: int
    Score: Optional[str] = None  # as entered (can be letter or number string)
    Score_numeric: Optional[float] = None  # for late/curve math
    Status: str  # 'submitted', 'graded', 'missing', 'late'
    Submissionid: Optional[int] = None
    Submitteddate: Optional[str] = None
    Late_deduction_applied: Optional[float] = None  # points deducted for late
    Curved: bool = False


class GradebookRow(BaseModel):
    """One row: one student and their scores for all assignments."""
    Studentid: int
    Studentname: str
    Cells: List[GradebookCell]
    Course_grade: Optional[str] = None  # enrollment grade if set


class GradebookResponse(BaseModel):
    """Full gradebook for a course."""
    Courseid: int
    Coursename: str
    Assignment_headers: List[dict]  # [{"Assignmentid", "Assignmentname", "Points"}]
    Rows: List[GradebookRow]
    Apply_late_policy: bool = False
    Curve_to_score: Optional[float] = None  # e.g. 100 if curve applied
