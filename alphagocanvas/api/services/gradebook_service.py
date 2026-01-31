"""Gradebook service: full course gradebook with late policy and curve."""
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from alphagocanvas.api.models.gradebook import (
    GradebookResponse,
    GradebookRow,
    GradebookCell,
)
from alphagocanvas.database.models import (
    AssignmentTable,
    StudentEnrollmentTable,
    SubmissionTable,
    StudentTable,
    CourseTable,
)


def _parse_score(score_str: Optional[str]) -> Optional[float]:
    """Parse score string to float; return None if not numeric."""
    if not score_str:
        return None
    try:
        return float(score_str.strip())
    except (ValueError, TypeError):
        return None


def _days_late(due_iso: Optional[str], submitted_iso: Optional[str]) -> float:
    """Return days (can be fractional) that submission is late; 0 if on time or early."""
    if not due_iso or not submitted_iso:
        return 0.0
    try:
        due = datetime.fromisoformat(due_iso.replace("Z", "+00:00"))
        sub = datetime.fromisoformat(submitted_iso.replace("Z", "+00:00"))
        if sub.tzinfo:
            due = due.replace(tzinfo=sub.tzinfo) if not due.tzinfo else due
        delta = (sub - due).total_seconds() / 86400.0
        return max(0.0, delta)
    except (ValueError, TypeError):
        return 0.0


def get_gradebook(
    db: Session,
    course_id: int,
    semester: Optional[str] = None,
    apply_late_policy: bool = False,
    curve_to_score: Optional[float] = None,
) -> GradebookResponse:
    """
    Build full gradebook: students x assignments with scores and status.
    Optionally apply late policy (per-assignment) and curve (scale so max = curve_to_score).
    """
    # Course name
    course = db.query(CourseTable).filter(CourseTable.Courseid == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course_name = course.Coursename or ""

    # Enrolled students (optionally filter by semester)
    enrollment_query = db.query(StudentEnrollmentTable).filter(
        StudentEnrollmentTable.Courseid == course_id
    )
    if semester:
        enrollment_query = enrollment_query.filter(
            StudentEnrollmentTable.EnrollmentSemester == semester
        )
    enrollments = enrollment_query.all()
    if not enrollments:
        return GradebookResponse(
            Courseid=course_id,
            Coursename=course_name,
            Assignment_headers=[],
            Rows=[],
            Apply_late_policy=apply_late_policy,
            Curve_to_score=curve_to_score,
        )

    student_ids = [e.Studentid for e in enrollments]
    student_map = {}
    for s in db.query(StudentTable).filter(StudentTable.Studentid.in_(student_ids)).all():
        student_map[s.Studentid] = f"{s.Studentfirstname or ''} {s.Studentlastname or ''}".strip() or str(s.Studentid)

    enrollment_grades = {e.Studentid: e.EnrollmentGrades for e in enrollments}

    # Assignments for course (include new columns if present)
    try:
        assignments = db.query(AssignmentTable).filter(
            AssignmentTable.Courseid == course_id
        ).order_by(AssignmentTable.Assignmentid).all()
    except Exception:
        assignments = []

    if not assignments:
        rows = [
            GradebookRow(
                Studentid=sid,
                Studentname=student_map.get(sid, str(sid)),
                Cells=[],
                Course_grade=enrollment_grades.get(sid),
            )
            for sid in student_ids
        ]
        return GradebookResponse(
            Courseid=course_id,
            Coursename=course_name,
            Assignment_headers=[],
            Rows=rows,
            Apply_late_policy=apply_late_policy,
            Curve_to_score=curve_to_score,
        )

    # Assignment headers and late policy fields
    headers = []
    assignment_info = []
    for a in assignments:
        headers.append({
            "Assignmentid": a.Assignmentid,
            "Assignmentname": a.Assignmentname or "",
            "Points": getattr(a, "Points", None) or 100,
        })
        points = getattr(a, "Points", None) or 100
        due = getattr(a, "Duedate", None)
        pct_per_day = getattr(a, "Latepolicy_percent_per_day", None)
        grace_mins = getattr(a, "Latepolicy_grace_minutes", None) or 0
        assignment_info.append({
            "points": points,
            "duedate": due,
            "percent_per_day": pct_per_day,
            "grace_minutes": grace_mins,
        })

    # All submissions for these assignments
    subs_query = text("""
        SELECT s.Submissionid, s.Assignmentid, s.Studentid, s.Submissionscore,
               s.Submissiongraded, s.Submitteddate
        FROM submissions s
        WHERE s.Assignmentid = ANY(:assignment_ids)
    """)
    assignment_ids = [a.Assignmentid for a in assignments]
    subs_rows = db.execute(subs_query, {"assignment_ids": assignment_ids}).fetchall()
    # (student_id, assignment_id) -> (score, graded, submitteddate)
    sub_map = {}
    for row in subs_rows:
        key = (row.Studentid, row.Assignmentid)
        sub_map[key] = {
            "Submissionid": row.Submissionid,
            "Submissionscore": row.Submissionscore,
            "Submissiongraded": row.Submissiongraded,
            "Submitteddate": row.Submitteddate,
        }

    # Build rows
    all_scores_numeric = []  # for curve
    rows = []
    for sid in student_ids:
        cells = []
        for i, a in enumerate(assignments):
            info = assignment_info[i]
            key = (sid, a.Assignmentid)
            sub = sub_map.get(key)
            score_str = None
            score_numeric = None
            status = "missing"
            submission_id = None
            submitted_date = None
            late_deduction = None

            if sub:
                submission_id = sub["Submissionid"]
                submitted_date = sub["Submitteddate"]
                score_str = sub["Submissionscore"]
                score_numeric = _parse_score(score_str)
                if sub["Submissiongraded"]:
                    status = "graded"
                else:
                    status = "submitted"
                # Late?
                if info["duedate"] and submitted_date:
                    days = _days_late(info["duedate"], submitted_date)
                    if days > 0 and status == "graded":
                        status = "late"
                    if apply_late_policy and info["percent_per_day"] and score_numeric is not None and days > 0:
                        # Grace: treat as on time for grace_minutes
                        grace_days = (info["grace_minutes"] or 0) / (60 * 24)
                        days_after_grace = max(0, days - grace_days)
                        deduction_pct = days_after_grace * info["percent_per_day"]
                        late_deduction = min(score_numeric, info["points"] * (deduction_pct / 100.0))
                        score_numeric = max(0, score_numeric - late_deduction)
                        score_str = f"{score_numeric:.1f}"
                if score_numeric is not None:
                    all_scores_numeric.append(score_numeric)

            cells.append(GradebookCell(
                Assignmentid=a.Assignmentid,
                Assignmentname=a.Assignmentname or "",
                Points_possible=info["points"],
                Score=score_str,
                Score_numeric=score_numeric,
                Status=status,
                Submissionid=submission_id,
                Submitteddate=submitted_date,
                Late_deduction_applied=late_deduction,
                Curved=False,
            ))

        rows.append(GradebookRow(
            Studentid=sid,
            Studentname=student_map.get(sid, str(sid)),
            Cells=cells,
            Course_grade=enrollment_grades.get(sid),
        ))

    # Optional curve: scale so max score = curve_to_score
    if curve_to_score is not None and all_scores_numeric:
        max_score = max(all_scores_numeric)
        if max_score > 0:
            new_rows = []
            for row in rows:
                new_cells = []
                for cell in row.Cells:
                    if cell.Score_numeric is not None:
                        curved_num = (cell.Score_numeric / max_score) * curve_to_score
                        new_cells.append(GradebookCell(
                            Assignmentid=cell.Assignmentid,
                            Assignmentname=cell.Assignmentname,
                            Points_possible=cell.Points_possible,
                            Score=f"{curved_num:.1f}",
                            Score_numeric=curved_num,
                            Status=cell.Status,
                            Submissionid=cell.Submissionid,
                            Submitteddate=cell.Submitteddate,
                            Late_deduction_applied=cell.Late_deduction_applied,
                            Curved=True,
                        ))
                    else:
                        new_cells.append(cell)
                new_rows.append(GradebookRow(
                    Studentid=row.Studentid,
                    Studentname=row.Studentname,
                    Cells=new_cells,
                    Course_grade=row.Course_grade,
                ))
            rows = new_rows

    return GradebookResponse(
        Courseid=course_id,
        Coursename=course_name,
        Assignment_headers=headers,
        Rows=rows,
        Apply_late_policy=apply_late_policy,
        Curve_to_score=curve_to_score,
    )
