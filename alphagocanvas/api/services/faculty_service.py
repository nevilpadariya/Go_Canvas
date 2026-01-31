from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import text

from alphagocanvas.api.models.faculty import CoursesByFaculty, AddSyllabusRequest, AddSyllabusResponse, \
    StudentGradeFaculty, StudentGradeFacultyResponse, QuizRequestFacultyResponse, \
    QuizRequestFacultyRequest, AssignmentRequestFacultyRequest, AssignmentRequestFacultyResponse, \
    AnnouncementRequestFacultyRequest, AnnouncementRequestFacultyResponse, AssignmentResponse, QuizResponse, \
    AnnouncementResponse, FacultyCourseDetails
from alphagocanvas.api.models.student import StudentInformationDetails, CourseStudentGrade
from alphagocanvas.database import database_dependency
from alphagocanvas.database.models import (
    CourseFacultyTable,
    StudentEnrollmentTable,
    QuizTable,
    AssignmentTable,
    AnnouncementTable,
    SubmissionTable,
    StudentTable,
)


def get_courses_by_faculty(db: database_dependency, facultyid: int) -> List[CoursesByFaculty]:
    raw_query = text(
        """
    SELECT 
        c."Courseid", c."Coursename", cf."Coursesemester", f."Facultyfirstname", f."Facultylastname", f."Facultyid", cf."Coursepublished"
    FROM 
        coursefaculty cf
    JOIN 
        courses c ON cf."Coursecourseid" = c."Courseid"
    JOIN 
        faculty f ON cf."Coursefacultyid" = f."Facultyid"
    WHERE
        f."Facultyid" = :facultyid;"""
    )

    courses = db.execute(raw_query, {"facultyid": facultyid}).fetchall()
    courses_list = []
    if len(courses) == 0:
        raise HTTPException(status_code=404, detail="Data not found")
    for course in courses:
        if course.Coursepublished is None:
            course.Coursepublished = False

        courses_list.append(CoursesByFaculty(Courseid=course.Courseid,
                                             Coursename=course.Coursename,
                                             Facultyfirstname=course.Facultyfirstname,
                                             Facultyid=course.Facultyid,
                                             Facultylastname=course.Facultylastname,
                                             Coursesemester=course.Coursesemester,
                                             Coursepublished=course.Coursepublished))

    return courses_list


def update_syllabus_description(db: database_dependency, facultyid: int, params: AddSyllabusRequest):
    existing_record = db.query(CourseFacultyTable).filter(
        CourseFacultyTable.Coursefacultyid == facultyid,
        CourseFacultyTable.Coursecourseid == params.Courseid,
        CourseFacultyTable.Coursesemester == params.Coursesemester
    ).first()

    if not existing_record:
        raise HTTPException(status_code=404, detail="Given course does not exist")

    existing_record.Coursedescription = params.Coursedescription
    db.commit()

    return AddSyllabusResponse(Success="Syllabus description for the given course has been updated successfully")


def view_students_for_each_course(db: database_dependency, courseid: int, facultyid: int | None = None) -> List[StudentInformationDetails]:
    where_clause = 'se."Courseid" = :courseid'
    params: dict = {"courseid": courseid}
    if facultyid is not None:
        where_clause += ' AND se."Facultyid" = :facultyid'
        params["facultyid"] = facultyid
    raw_query = text(
        f"""
        SELECT 
            se."Studentid",
            CONCAT(s."Studentfirstname", ' ', s."Studentlastname") AS "Studentname",
            s."Studentcontactnumber",
            COALESCE(u."Useremail", '') AS "Studentemail",
            c."Coursename",
            se."EnrollmentSemester",
            se."EnrollmentGrades"
        FROM 
            studentenrollment se
        JOIN 
            student s ON se."Studentid" = s."Studentid"
        LEFT JOIN 
            usertable u ON u."Userid" = s."Studentid"
        JOIN 
            courses c ON se."Courseid" = c."Courseid"
        WHERE 
            {where_clause};
        """
    )

    students = db.execute(raw_query, params).fetchall()

    if not students:
        raise HTTPException(status_code=404, detail="No students are enrolled in that course")

    students_list = []
    for student in students:
        students_list.append(StudentInformationDetails(Studentid=student.Studentid,
                                                       Studentname=student.Studentname,
                                                       Studentcontactnumber=student.Studentcontactnumber or "",
                                                       Studentemail=getattr(student, "Studentemail", "") or "",
                                                       Coursename=student.Coursename,
                                                       Coursesemester=student.EnrollmentSemester,
                                                       Coursegrade=student.EnrollmentGrades or ""))

    return students_list


def view_students_for_each_course_service(db: database_dependency, courseid: int) -> List[CourseStudentGrade]:
    raw_query = text(
        """
        SELECT
            se."Studentid",
            se."EnrollmentGrades",
            CONCAT(s."Studentfirstname", ' ', s."Studentlastname") AS "Studentname",
            se."EnrollmentSemester",
            c."Coursename"
        FROM
            studentenrollment se
        JOIN
            student s ON se."Studentid" = s."Studentid"
        JOIN
           courses c ON se."Courseid" = c."Courseid"
        WHERE
            se."Courseid" = :courseid;
        """
    )

    students = db.execute(raw_query, {"courseid": courseid}).fetchall()

    if not students:
        raise HTTPException(status_code=404, detail="No grades found for that courses")

    students_grade_list = []
    for student in students:
        students_grade_list.append(CourseStudentGrade(Studentid=student.Studentid,
                                                      EnrollmentGrades=student.EnrollmentGrades,
                                                      Studentname=student.Studentname,
                                                      EnrollmentSemester=student.EnrollmentSemester,
                                                      Coursename=student.Coursename))

    return students_grade_list


def update_grade_students(facultyid: int, params: StudentGradeFaculty, db: database_dependency) \
        -> StudentGradeFacultyResponse:
    existing_record = db.query(StudentEnrollmentTable).filter(
        StudentEnrollmentTable.Studentid == params.Studentid,
        StudentEnrollmentTable.Courseid == params.Courseid,
        StudentEnrollmentTable.EnrollmentSemester == params.Semester
    ).first()

    if not existing_record:
        raise HTTPException(status_code=404, detail="Student is not founded with that course in given semester")

    if existing_record.Facultyid != facultyid:
        raise HTTPException(status_code=403,
                            detail="This student cannot be graded by you; they are not enrolled in your course.")

    if existing_record and existing_record.Facultyid == facultyid:
        existing_record.EnrollmentGrades = params.Grade
        db.commit()

    return StudentGradeFacultyResponse(Success="Grades has been updated successfully")


def add_quiz_to_course(params: QuizRequestFacultyRequest, facultyid: int,
                       db: database_dependency) -> QuizRequestFacultyResponse:
    existing_record = db.query(CourseFacultyTable).filter(
        CourseFacultyTable.Coursefacultyid == facultyid,
        CourseFacultyTable.Coursecourseid == params.Courseid,
        CourseFacultyTable.Coursesemester == params.Semester
    ).first()

    if not existing_record:
        raise HTTPException(status_code=404,
                            detail="Quiz can not be added to this course by you, check Semester, Course")
    if existing_record:
        new_record = QuizTable(
            quizname=params.Quizname,
            quizdescription=params.Quizdescription,
            Courseid=params.Courseid
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    return QuizRequestFacultyResponse(Success="Quiz has been updated successfully")


def add_assignment_to_course(params: AssignmentRequestFacultyRequest,
                             facultyid: int,
                             db: database_dependency) -> AssignmentRequestFacultyResponse:
    existing_record = db.query(CourseFacultyTable).filter(
        CourseFacultyTable.Coursefacultyid == facultyid,
        CourseFacultyTable.Coursecourseid == params.Courseid,
        CourseFacultyTable.Coursesemester == params.Semester
    ).first()

    if not existing_record:
        raise HTTPException(status_code=404,
                            detail="Assignment can not be added to this course by you, check Semester, Course")

    if existing_record:
        new_record = AssignmentTable(
            Assignmentname=params.Assignmentname,
            Assignmentdescription=params.Assignmentdescription,
            Courseid=params.Courseid,
            Duedate=getattr(params, "Duedate", None),
            Points=params.Points if getattr(params, "Points", None) is not None else 100,
            Submissiontype=getattr(params, "Submissiontype", None) or "text_and_file",
            Latepolicy_percent_per_day=getattr(params, "Latepolicy_percent_per_day", None),
            Latepolicy_grace_minutes=getattr(params, "Latepolicy_grace_minutes", None),
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    return AssignmentRequestFacultyResponse(Success="Assignment has been updated successfully")


def add_announcement_to_course(params: AnnouncementRequestFacultyRequest,
                               facultyid: int,
                               db: database_dependency) -> AnnouncementRequestFacultyResponse:
    existing_record = db.query(CourseFacultyTable).filter(
        CourseFacultyTable.Coursefacultyid == facultyid,
        CourseFacultyTable.Coursecourseid == params.Courseid,
        CourseFacultyTable.Coursesemester == params.Semester
    ).first()

    if not existing_record:
        raise HTTPException(status_code=404,
                            detail="Assignment can not be added to this course by you, check Semester, Course")

    if existing_record:
        new_record = AnnouncementTable(
            Announcementname=params.Announcementname,
            Announcementdescription=params.Announcementdescription,
            Courseid=params.Courseid
        )

        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    return AnnouncementRequestFacultyResponse(Success="Announcement has been updated successfully")


def get_assignments_by_courseid(db: database_dependency, courseid: int) -> List[AssignmentResponse]:
    raw_query = """
        SELECT a."Assignmentid", a."Assignmentname", a."Assignmentdescription", a."Courseid",
               a."Duedate", a."Points", a."Submissiontype", a."Latepolicy_percent_per_day", a."Latepolicy_grace_minutes"
        FROM assignments a
        WHERE a."Courseid" = :courseid;
    """
    try:
        results = db.execute(text(raw_query), {"courseid": courseid})
    except Exception:
        raw_query = """
            SELECT a."Assignmentid", a."Assignmentname", a."Assignmentdescription", a."Courseid"
            FROM assignments a
            WHERE a."Courseid" = :courseid;
        """
        results = db.execute(text(raw_query), {"courseid": courseid})
        assignments = results.fetchall()
        assignments_list = [
            AssignmentResponse(
                Assignmentid=a.Assignmentid,
                Assignmentname=a.Assignmentname,
                Assignmentdescription=a.Assignmentdescription or "",
                Courseid=a.Courseid,
            )
            for a in assignments
        ]
        return assignments_list

    assignments = results.fetchall()
    assignments_list = []
    for assignment in assignments:
        assignment_response = AssignmentResponse(
            Assignmentid=assignment.Assignmentid,
            Assignmentname=assignment.Assignmentname,
            Assignmentdescription=assignment.Assignmentdescription or "",
            Courseid=assignment.Courseid,
            Duedate=getattr(assignment, "Duedate", None),
            Points=getattr(assignment, "Points", 100),
            Submissiontype=getattr(assignment, "Submissiontype", "text_and_file"),
            Latepolicy_percent_per_day=getattr(assignment, "Latepolicy_percent_per_day", None),
            Latepolicy_grace_minutes=getattr(assignment, "Latepolicy_grace_minutes", None),
        )
        assignments_list.append(assignment_response)

    return assignments_list


def get_quizzes_by_courseid(db: database_dependency, courseid: int) -> List[QuizResponse]:
    """
    Fetch quizzes for a specific course based on courseid.

    :param db: SQLAlchemy Session object
    :param courseid: Course ID
    :return: List of quizzes
    """
    raw_query = """
        SELECT q.quizid, q.quizname, q.quizdescription, q."Courseid"
        FROM quizzes q
        WHERE q."Courseid" = :courseid;
    """

    results = db.execute(text(raw_query), {"courseid": courseid})
    quizzes = results.fetchall()

    quizzes_list = []
    for quiz in quizzes:
        quiz_response = QuizResponse(
            Quizid=quiz.quizid,
            Quizname=quiz.quizname,
            Quizdescription=quiz.quizdescription,
            Courseid=quiz.Courseid
        )
        quizzes_list.append(quiz_response)

    return quizzes_list


def get_announcements_by_courseid(db: database_dependency, courseid: int) -> List[AnnouncementResponse]:
    """
    Fetch announcements for a specific course based on courseid.

    :param db: SQLAlchemy Session object
    :param courseid: Course ID
    :return: List of announcements
    """
    raw_query = """
        SELECT ann."Announcementid", ann."Announcementname", ann."Announcementdescription", ann."Courseid"
        FROM announcements ann
        WHERE ann."Courseid" = :courseid;
    """

    results = db.execute(text(raw_query), {"courseid": courseid})
    announcements = results.fetchall()

    announcements_list = []
    for announcement in announcements:
        announcement_response = AnnouncementResponse(
            Announcementid=announcement.Announcementid,
            Announcementname=announcement.Announcementname,
            Announcementdescription=announcement.AnnouncementDescription,
            Courseid=announcement.Courseid
        )
        announcements_list.append(announcement_response)

    return announcements_list


def get_course_faculty_details(db: database_dependency, courseid: int) -> List[FacultyCourseDetails]:
    raw_query = text("""
        SELECT
            cf."Coursecourseid",
            cf."Coursesemester",
            cf."Coursedescription"
        FROM
            coursefaculty cf
        WHERE
            cf."Coursecourseid" = :courseid AND cf."Coursepublished" = TRUE;
        """)

    published_courses = db.execute(raw_query, {"courseid": courseid}).fetchall()

    if len(published_courses) == 0:
        raise HTTPException(status_code=404, detail="Data not found")

    published_courses_list = []

    for course in published_courses:
        published_courses_list.append(FacultyCourseDetails(
            Coursecourseid=course.Coursecourseid,
            Coursesemester=course.Coursesemester,
            Coursedescription=course.Coursedescription
        ))

    return published_courses_list


def get_messageable_students(
    db: database_dependency,
    courseid: int,
    criteria: str,
    assignment_id: Optional[int] = None,
) -> List[dict]:
    """
    Return students in course filtered by criteria for "Message Students Who".
    criteria: 'not_submitted' (requires assignment_id), 'all'
    Returns list of {Studentid, Studentname}.
    """
    students_in_course = view_students_for_each_course(db, courseid)
    if criteria == "all":
        return [
            {"Studentid": s.Studentid, "Studentname": s.Studentname}
            for s in students_in_course
        ]
    if criteria == "not_submitted" and assignment_id is not None:
        submitted_ids = {
            (row.Studentid if hasattr(row, "Studentid") else row[0])
            for row in db.query(SubmissionTable.Studentid).filter(
                SubmissionTable.Assignmentid == assignment_id
            ).distinct().all()
        }
        return [
            {"Studentid": s.Studentid, "Studentname": s.Studentname}
            for s in students_in_course
            if s.Studentid not in submitted_ids
        ]
    return []