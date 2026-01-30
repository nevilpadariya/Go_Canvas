from typing import List

from fastapi import HTTPException
from sqlalchemy import text

from alphagocanvas.api.models.admin import AdminCoursesByFaculty, StudentInformationCourses, CoursesForAdmin, \
    FacultyForAdmin, UserResponse, StudentCourseDetail, AssignCourseRequest
from alphagocanvas.api.models.course import CourseFacultySemesterRequest, CourseFacultySemesterResponse
from alphagocanvas.database import database_dependency
from alphagocanvas.database.models import CourseFacultyTable, CourseTable, FacultyTable, UserTable, StudentTable


def get_courses_by_faculty(db: database_dependency, adminid: int) -> List[AdminCoursesByFaculty]:
    """

    :param adminid:
    :param db: database dependency object, which will retrieve the object

    :return: List[AdminCoursesByFaculty] (List of Json objects)
    """

    raw_query = text(
        """
        SELECT
            cs.Coursecourseid,
            cs.Coursefacultyid,
            c.Coursename,
            cs.Coursedescription,
            f.Facultyfirstname,
            f.Facultylastname,
            cs.Coursesemester,
            cs.Coursepublished
        FROM
            coursefaculty cs
        JOIN
            faculty f ON cs.Coursefacultyid = f.Facultyid
        JOIN
            courses c ON cs.Coursecourseid = c.Courseid;
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
            se.Studentid,
            s.Studentfirstname,
            s.Studentlastname,
            s.Studentcontactnumber,
            c.Courseid,
            c.Coursename,
            se.EnrollmentSemester
        FROM
            studentenrollment se
        JOIN
            courses c ON c.Courseid = se.Courseid
        JOIN
            student s ON s.Studentid = se.Studentid;
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
            Userlastname=user.lastname
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
                # Remove from student table
                db.delete(student)
        elif old_role == "Faculty":
            faculty = db.query(FacultyTable).filter(FacultyTable.Facultyid == user_id).first()
            if faculty:
                firstname = faculty.Facultyfirstname
                lastname = faculty.Facultylastname
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
    
    # Check if already enrolled
    existing = db.query(StudentEnrollmentTable).filter(
        StudentEnrollmentTable.Studentid == params.student_id,
        StudentEnrollmentTable.Courseid == params.course_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="Student already enrolled in this course")
        
    new_enrollment = StudentEnrollmentTable(
        Studentid=params.student_id,
        Courseid=params.course_id,
        EnrollmentSemester=params.semester,
        EnrollmentGrades=None, 
        Facultyid=None # Optionally could assign faculty lookup logic here if needed, but per request just assigning course
    )
    
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)  # Ensure the record is properly persisted
    
    return {"message": "Successfully assigned course to student", "enrollment_id": new_enrollment.Enrollmentid}
