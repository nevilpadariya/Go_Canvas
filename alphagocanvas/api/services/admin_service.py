from typing import List

from fastapi import HTTPException
from sqlalchemy import text

from alphagocanvas.api.models.admin import AdminCoursesByFaculty, StudentInformationCourses, CoursesForAdmin, \
    FacultyForAdmin, UserResponse, StudentCourseDetail, AssignCourseRequest, CreateCourseRequest
from alphagocanvas.api.models.course import CourseFacultySemesterRequest, CourseFacultySemesterResponse
from alphagocanvas.database import database_dependency
from alphagocanvas.database.models import (
    CourseTable,
    FacultyTable,
    UserTable,
    StudentTable,
    AssignmentTable,
    QuizTable,
    QuizQuestionTable,
    QuizQuestionOptionTable,
    ModuleTable,
    ModuleItemTable,
    SubmissionTable,
    StudentEnrollmentTable,
    GradeTable,
    QuizAttemptTable,
    DiscussionGradeTable,
    CourseFacultyTable,
    CalendarEventTable,
    ConversationParticipantTable,
    MessageTable,
    SubmissionCommentTable,
    DiscussionReplyTable,
    DiscussionTable,
)


def get_courses_by_faculty(db: database_dependency, adminid: int) -> List[AdminCoursesByFaculty]:
    """

    :param adminid:
    :param db: database dependency object, which will retrieve the object

    :return: List[AdminCoursesByFaculty] (List of Json objects)
    """

    raw_query = text(
        """
        SELECT
            cs."Coursecourseid",
            cs."Coursefacultyid",
            c."Coursename",
            cs."Coursedescription",
            f."Facultyfirstname",
            f."Facultylastname",
            cs."Coursesemester",
            cs."Coursepublished"
        FROM
            coursefaculty cs
        JOIN
            faculty f ON cs."Coursefacultyid" = f."Facultyid"
        JOIN
            courses c ON cs."Coursecourseid" = c."Courseid";
        """)

    courses = db.execute(raw_query).fetchall()
    courses_list = []

    # check if courses are not null, if yes, then raise error
    if len(courses) == 0:
        return []
    for course in courses:
        courses_list.append(AdminCoursesByFaculty(Courseid=course.Coursecourseid,
                                                  Facultyid=course.Coursefacultyid,
                                                  Coursename=course.Coursename,
                                                  Coursedescription="" if course.Coursedescription is None else course.Coursedescription,
                                                  Facultyfirstname=course.Facultyfirstname,
                                                  Facultylastname=course.Facultylastname,
                                                  Adminid=adminid,
                                                  Coursesemester=course.Coursesemester,
                                                  Coursepublished=course.Coursepublished if course.Coursepublished is not None else 0))

    return courses_list


def assign_course_to_faculty(db: database_dependency, params: CourseFacultySemesterRequest):
    """

    :param db: database dependency object
    :param params: CourseFacultySemester object with relevant data
    :return:
    """

    if not params:
        raise HTTPException(status_code=404, detail="Data not found")

    course_faculty = CourseFacultyTable(
        Coursefacultyid=params.Facultyid,
        Coursecourseid=params.Courseid,
        Coursesemester=params.Coursesemester,
        Coursepublished=0,
        Coursedescription="This is default course syllabus"
    )

    existing_record = db.query(CourseFacultyTable).filter(
        CourseFacultyTable.Coursefacultyid == params.Facultyid,
        CourseFacultyTable.Coursecourseid == params.Courseid,
        CourseFacultyTable.Coursesemester == params.Coursesemester
    ).first()

    if existing_record:
        raise HTTPException(status_code=409, detail="Record already exists in the database")
    else:
        db.add(course_faculty)
        db.commit()

    return CourseFacultySemesterResponse(Success="Successfully assigned courses to faculty")


def get_students(db: database_dependency) -> List[StudentInformationCourses]:
    """

    :param db: database dependency objects
    :return:
    """

    raw_query = text("""
        SELECT
            se."Studentid",
            s."Studentfirstname",
            s."Studentlastname",
            s."Studentcontactnumber",
            c."Courseid",
            c."Coursename",
            se."EnrollmentSemester"
        FROM
            studentenrollment se
        JOIN
            courses c ON c."Courseid" = se."Courseid"
        JOIN
            student s ON s."Studentid" = se."Studentid";
        """)

    students = db.execute(raw_query).fetchall()

    if len(students) == 0:
        return []

    student_list = []

    """
    class StudentInformationCourses(BaseModel):
    Studentid : int
    Studentfirstname : str
    Studentlastname : str
    Studentcontactnumber : str
    Courseid : int
    Coursename : str"""

    for student in students:
        student_list.append(StudentInformationCourses(Studentid=student.Studentid,
                                                      Studentfirstname=student.Studentfirstname,
                                                      Studentlastname=student.Studentlastname,
                                                      Studentcontactnumber=student.Studentcontactnumber,
                                                      Courseid=student.Courseid,
                                                      Coursename=student.Coursename,
                                                      Coursesemester=student.EnrollmentSemester))

    return student_list


def get_courses(db: database_dependency) -> List[CoursesForAdmin]:
    """
    db : database dependency

    returns : list of all courses
    """

    courses = db.query(CourseTable).all()

    course_list = []

    for course in courses:
        course_list.append(CoursesForAdmin(Courseid=course.Courseid,
                                           Coursename=course.Coursename))

    return course_list


def create_course(db: database_dependency, params: CreateCourseRequest) -> dict:
    """Create a new course; Courseid = MAX(Courseid)+1."""
    from sqlalchemy import func
    max_id = db.query(func.coalesce(func.max(CourseTable.Courseid), 0)).scalar()
    new_id = max_id + 1
    course = CourseTable(Courseid=new_id, Coursename=params.Coursename)
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"Courseid": course.Courseid, "Coursename": course.Coursename}


def get_faculties(db: database_dependency) -> List[FacultyForAdmin]:
    """
    db : database dependency

    returns : list of all faculties
    """

    faculties = db.query(FacultyTable).all()

    faculty_list = []

    for faculty in faculties:
        faculty_name = faculty.Facultyfirstname + " " + faculty.Facultylastname

        faculty_list.append(FacultyForAdmin(Facultyid=faculty.Facultyid,
                                            Facultyname=faculty_name))

    return faculty_list


def get_all_users(db: database_dependency) -> List[UserResponse]:
    """
    Fetch all users with their details (role, name, etc.)
    """
    raw_query = text("""
        SELECT 
            u."Userid", 
            u."Useremail", 
            u."Userrole",
            u."Createdat",
            u."Isactive",
            COALESCE(s."Studentfirstname", f."Facultyfirstname", '') as firstname,
            COALESCE(s."Studentlastname", f."Facultylastname", '') as lastname
        FROM 
            usertable u
        LEFT JOIN 
            student s ON u."Userid" = s."Studentid"
        LEFT JOIN 
            faculty f ON u."Userid" = f."Facultyid"
        ORDER BY u."Userid" DESC;
    """)
    
    users = db.execute(raw_query).fetchall()
    
    user_list = []
    for user in users:
        user_list.append(UserResponse(
            Userid=user.Userid,
            Useremail=user.Useremail,
            Userrole=user.Userrole,
            Userfirstname=user.firstname,
            Userlastname=user.lastname,
            Createdat=user.Createdat,
            Isactive=user.Isactive
        ))
        
    return user_list


def update_user_role(db: database_dependency, user_id: int, new_role: str):
    """
    Update a user's role and migrate their data to the correct table
    """
    # 1. Get current user info to access names if needed
    user = db.query(UserTable).filter(UserTable.Userid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_role = user.Userrole
    
    if old_role == new_role:
        return {"message": f"User is already {new_role}"}
    
    try:
        # 2. Handle Data Migration
        firstname = "Unknown"
        lastname = "User"
        
        # Get names from existing role table
        if old_role == "Student":
            student = db.query(StudentTable).filter(StudentTable.Studentid == user_id).first()
            if student:
                firstname = student.Studentfirstname
                lastname = student.Studentlastname
                
                # Remove dependent student records to valid FK constraints
                db.query(StudentEnrollmentTable).filter(StudentEnrollmentTable.Studentid == user_id).delete()
                db.query(GradeTable).filter(GradeTable.Studentid == user_id).delete()
                db.query(SubmissionTable).filter(SubmissionTable.Studentid == user_id).delete()
                db.query(QuizAttemptTable).filter(QuizAttemptTable.Studentid == user_id).delete()
                db.query(DiscussionGradeTable).filter(DiscussionGradeTable.Studentid == user_id).delete()

                # Remove from student table
                db.delete(student)
        elif old_role == "Faculty":
            faculty = db.query(FacultyTable).filter(FacultyTable.Facultyid == user_id).first()
            if faculty:
                firstname = faculty.Facultyfirstname
                lastname = faculty.Facultylastname
                
                # Remove dependent faculty records
                db.query(CourseFacultyTable).filter(CourseFacultyTable.Coursefacultyid == user_id).delete()
                
                # Nullify faculty in enrollments
                enrollments = db.query(StudentEnrollmentTable).filter(StudentEnrollmentTable.Facultyid == user_id).all()
                for enrollment in enrollments:
                    enrollment.Facultyid = None
                    
                # Remove from faculty table
                db.delete(faculty)
        
        # Add to new role table
        if new_role == "Faculty":
            new_faculty = FacultyTable(
                Facultyid=user_id,
                Facultyfirstname=firstname,
                Facultylastname=lastname
            )
            db.add(new_faculty)
        elif new_role == "Student":
            new_student = StudentTable(
                Studentid=user_id,
                Studentfirstname=firstname,
                Studentlastname=lastname,
                Studentcontactnumber="",
                Studentnotification=True
            )
            db.add(new_student)
            
        # 3. Update UserTable
        user.Userrole = new_role
        
        db.commit()
        return {"message": f"Successfully updated user role to {new_role}"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")


def delete_user(db: database_dependency, user_id: int):
    """
    Soft delete a user (set Isactive=False) - kept for backward compatibility if needed, 
    but effectively same as deactivate_user
    """
    user = db.query(UserTable).filter(UserTable.Userid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.Isactive = False
    db.commit()
    return {"message": "User deactivated successfully"}


def activate_user(db: database_dependency, user_id: int):
    """
    Reactivate a user (set Isactive=True)
    """
    user = db.query(UserTable).filter(UserTable.Userid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.Isactive = True
    db.commit()
    return {"message": "User activated successfully"}


def hard_delete_user(db: database_dependency, user_id: int):
    """
    Hard delete a user (remove from database)
    CAUTION: Must delete all related data to avoid Foreign Key constraints
    """
    user = db.query(UserTable).filter(UserTable.Userid == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Delete Generic User Data (Calendar, Messages, Comments)
    # These tables use generic Userid/Authorid/Senderid
    db.query(CalendarEventTable).filter(CalendarEventTable.Userid == user_id).delete()
    db.query(ConversationParticipantTable).filter(ConversationParticipantTable.Userid == user_id).delete()
    db.query(MessageTable).filter(MessageTable.Senderid == user_id).delete()
    db.query(SubmissionCommentTable).filter(SubmissionCommentTable.Authorid == user_id).delete()
    db.query(DiscussionReplyTable).filter(DiscussionReplyTable.Authorid == user_id).delete()
    db.query(DiscussionTable).filter(DiscussionTable.Authorid == user_id).delete()

    # 2. Delete Role-Specific Data
    if user.Userrole == "Student":
        student = db.query(StudentTable).filter(StudentTable.Studentid == user_id).first()
        if student:
            # Delete dependent student records
            db.query(StudentEnrollmentTable).filter(StudentEnrollmentTable.Studentid == user_id).delete()
            db.query(GradeTable).filter(GradeTable.Studentid == user_id).delete()
            db.query(SubmissionTable).filter(SubmissionTable.Studentid == user_id).delete()
            db.query(QuizAttemptTable).filter(QuizAttemptTable.Studentid == user_id).delete()
            db.query(DiscussionGradeTable).filter(DiscussionGradeTable.Studentid == user_id).delete()
            
            # Finally delete the student record
            db.delete(student)
            
    elif user.Userrole == "Faculty":
        faculty = db.query(FacultyTable).filter(FacultyTable.Facultyid == user_id).first()
        if faculty:
            # Delete dependent faculty records
            db.query(CourseFacultyTable).filter(CourseFacultyTable.Coursefacultyid == user_id).delete()
            
            # Nullify faculty in enrollments (don't delete student enrollments just because faculty leaves)
            enrollments = db.query(StudentEnrollmentTable).filter(StudentEnrollmentTable.Facultyid == user_id).all()
            for enrollment in enrollments:
                enrollment.Facultyid = None
            
            # Finally delete the faculty record
            db.delete(faculty)

    # 3. Delete User Account
    db.delete(user)
    db.commit()
    return {"message": "User permanently deleted"}


def get_students_with_details(db: database_dependency) -> List[StudentCourseDetail]:
    """
    Fetch students with their course history and calculcated status
    """
    raw_query = text("""
        SELECT
            s."Studentid",
            s."Studentfirstname",
            s."Studentlastname",
            s."Studentcontactnumber",
            c."Courseid",
            c."Coursename",
            se."EnrollmentSemester",
            se."EnrollmentGrades"
        FROM
            student s
        JOIN
            studentenrollment se ON s."Studentid" = se."Studentid"
        JOIN
            courses c ON c."Courseid" = se."Courseid";
    """)

    results = db.execute(raw_query).fetchall()
    student_list = []

    for row in results:
        # Determine status based on grades
        status = "Current"
        if row.EnrollmentGrades:
            grade = row.EnrollmentGrades.upper()
            if grade in ['A', 'B', 'P']: # Assuming P is passing
                status = "Completed"
            elif grade in ['F', 'D']:
                status = "Failed"
            # Else remains "Current" (e.g. if grade is empty or N/A)
        
        student_list.append(StudentCourseDetail(
            Studentid=row.Studentid,
            Studentfirstname=row.Studentfirstname,
            Studentlastname=row.Studentlastname,
            Studentcontactnumber=row.Studentcontactnumber if row.Studentcontactnumber else "",
            Courseid=row.Courseid,
            Coursename=row.Coursename,
            Coursesemester=row.EnrollmentSemester,
            EnrollmentGrades=row.EnrollmentGrades,
            Status=status
        ))

    return student_list


def assign_course_to_student(db: database_dependency, params: AssignCourseRequest):
    from alphagocanvas.database.models import StudentEnrollmentTable

    existing = db.query(StudentEnrollmentTable).filter(
        StudentEnrollmentTable.Studentid == params.student_id,
        StudentEnrollmentTable.Courseid == params.course_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Student already enrolled in this course")

    faculty_id = None
    if params.faculty_id is not None:
        cf = db.query(CourseFacultyTable).filter(
            CourseFacultyTable.Coursecourseid == params.course_id,
            CourseFacultyTable.Coursefacultyid == params.faculty_id,
        ).first()
        if not cf:
            raise HTTPException(
                status_code=400,
                detail="Faculty is not assigned to this course; assign course to faculty first or omit faculty_id",
            )
        faculty_id = params.faculty_id

    new_enrollment = StudentEnrollmentTable(
        Studentid=params.student_id,
        Courseid=params.course_id,
        EnrollmentSemester=params.semester,
        EnrollmentGrades=None,
        Facultyid=faculty_id,
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return {"message": "Successfully assigned course to student", "enrollment_id": new_enrollment.Enrollmentid}


def get_admin_analytics(db: database_dependency) -> dict:
    """Dashboard stats: active users, courses, submissions in last 7/30 days."""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    now = datetime.utcnow()
    seven_days = (now - timedelta(days=7)).isoformat()
    thirty_days = (now - timedelta(days=30)).isoformat()
    total_users = db.query(UserTable).count()
    total_courses = db.query(CourseTable).count()
    total_students = db.query(StudentTable).count()
    total_faculty = db.query(FacultyTable).count()
    # Submissions in last 7/30 days (Submitteddate is ISO string)
    try:
        subs_7 = db.query(SubmissionTable).filter(SubmissionTable.Submitteddate >= seven_days).count()
        subs_30 = db.query(SubmissionTable).filter(SubmissionTable.Submitteddate >= thirty_days).count()
    except Exception:
        subs_7 = subs_30 = 0
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_students": total_students,
        "total_faculty": total_faculty,
        "submissions_last_7_days": subs_7,
        "submissions_last_30_days": subs_30,
    }


def copy_course_structure(db: database_dependency, source_course_id: int, target_course_id: int) -> dict:
    """Copy course structure: assignments, quizzes, modules, module items. No submissions or attempt data."""
    source = db.query(CourseTable).filter(CourseTable.Courseid == source_course_id).first()
    target = db.query(CourseTable).filter(CourseTable.Courseid == target_course_id).first()
    if not source or not target:
        raise HTTPException(status_code=404, detail="Course not found")
    assignment_id_map = {}
    for a in db.query(AssignmentTable).filter(AssignmentTable.Courseid == source_course_id).all():
        new_a = AssignmentTable(
            Assignmentname=a.Assignmentname,
            Assignmentdescription=a.Assignmentdescription,
            Courseid=target_course_id,
            Duedate=getattr(a, "Duedate", None),
            Points=getattr(a, "Points", 100),
            Submissiontype=getattr(a, "Submissiontype", "text_and_file"),
            Latepolicy_percent_per_day=getattr(a, "Latepolicy_percent_per_day", None),
            Latepolicy_grace_minutes=getattr(a, "Latepolicy_grace_minutes", None),
        )
        db.add(new_a)
        db.flush()
        assignment_id_map[a.Assignmentid] = new_a.Assignmentid
    quiz_id_map = {}
    for q in db.query(QuizTable).filter(QuizTable.Courseid == source_course_id).all():
        new_q = QuizTable(
            quizname=q.quizname,
            quizdescription=q.quizdescription,
            Courseid=target_course_id,
            Timelimitminutes=getattr(q, "Timelimitminutes", None),
            Allowedattempts=getattr(q, "Allowedattempts", None),
            Opensat=getattr(q, "Opensat", None),
            Closesat=getattr(q, "Closesat", None),
        )
        db.add(new_q)
        db.flush()
        quiz_id_map[q.quizid] = new_q.quizid
        # Copy quiz questions and options for this quiz
        for qu in db.query(QuizQuestionTable).filter(QuizQuestionTable.Quizid == q.quizid).order_by(QuizQuestionTable.Questionorder):
            new_qu = QuizQuestionTable(
                Quizid=new_q.quizid,
                Questiontext=qu.Questiontext,
                Questiontype=qu.Questiontype,
                Questionpoints=qu.Questionpoints or 1,
                Questionorder=qu.Questionorder or 0,
                Correctanswer=getattr(qu, "Correctanswer", None),
                Questionbankid=getattr(qu, "Questionbankid", None),
                Createdat=getattr(qu, "Createdat", None),
            )
            db.add(new_qu)
            db.flush()
            for opt in db.query(QuizQuestionOptionTable).filter(QuizQuestionOptionTable.Questionid == qu.Questionid).order_by(QuizQuestionOptionTable.Optionorder):
                new_opt = QuizQuestionOptionTable(
                    Questionid=new_qu.Questionid,
                    Optiontext=opt.Optiontext,
                    Iscorrect=opt.Iscorrect,
                    Optionorder=opt.Optionorder or 0,
                )
                db.add(new_opt)
    module_id_map = {}
    for m in db.query(ModuleTable).filter(ModuleTable.Courseid == source_course_id).order_by(ModuleTable.Moduleposition).all():
        new_m = ModuleTable(
            Modulename=m.Modulename,
            Moduledescription=m.Moduledescription,
            Moduleposition=m.Moduleposition or 0,
            Modulepublished=False,
            Courseid=target_course_id,
            Createdat=getattr(m, "Createdat", None),
        )
        db.add(new_m)
        db.flush()
        module_id_map[m.Moduleid] = new_m.Moduleid
    source_module_ids = list(module_id_map.keys())
    for item in db.query(ModuleItemTable).filter(ModuleItemTable.Moduleid.in_(source_module_ids)).order_by(ModuleItemTable.Itemposition):
        old_mid = item.Moduleid
        if old_mid not in module_id_map:
            continue
        new_ref = item.Referenceid
        if item.Itemtype == "assignment" and item.Referenceid and item.Referenceid in assignment_id_map:
            new_ref = assignment_id_map[item.Referenceid]
        elif item.Itemtype == "quiz" and item.Referenceid and item.Referenceid in quiz_id_map:
            new_ref = quiz_id_map[item.Referenceid]
        new_item = ModuleItemTable(
            Itemname=item.Itemname,
            Itemtype=item.Itemtype,
            Itemposition=item.Itemposition or 0,
            Itemcontent=item.Itemcontent,
            Itemurl=item.Itemurl,
            Moduleid=module_id_map[old_mid],
            Referenceid=new_ref,
            Unlockat=getattr(item, "Unlockat", None),
            Prerequisiteitemids=getattr(item, "Prerequisiteitemids", None),
            Createdat=getattr(item, "Createdat", None),
        )
        db.add(new_item)
    db.commit()
    return {"message": "Course structure copied", "target_course_id": target_course_id}
