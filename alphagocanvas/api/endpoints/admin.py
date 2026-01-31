from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.admin import AdminCoursesByFaculty, StudentInformationCourses, CoursesForAdmin, \
    FacultyForAdmin, UserResponse, UpdateRoleRequest, StudentCourseDetail, AssignCourseRequest, CreateCourseRequest
from alphagocanvas.api.models.course import CourseFacultySemesterRequest, CourseFacultySemesterResponse, CopyCourseRequest
from alphagocanvas.api.services.admin_service import (
    get_courses_by_faculty,
    assign_course_to_faculty,
    get_students,
    get_courses,
    create_course,
    get_faculties,
    get_all_users,
    update_user_role,
    get_students_with_details,
    assign_course_to_student,
    get_admin_analytics,
    copy_course_structure,
)
from alphagocanvas.api.utils.auth import is_current_user_admin, decode_token
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/view_courses_by_faculty",
            dependencies=[Depends(is_current_user_admin)], response_model=List[AdminCoursesByFaculty])
async def get_profile(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=401, detail="Unauthorised method")

    adminid = decoded_token.get("userid")

    courses_by_faculty = get_courses_by_faculty(db, adminid)

    return courses_by_faculty


@router.post("/assign_course",
             dependencies=[Depends(is_current_user_admin)],
             response_model=CourseFacultySemesterResponse)
async def assign_course(params: CourseFacultySemesterRequest,
                        db: database_dependency,
                        token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    response = assign_course_to_faculty(db, params)

    return response


@router.get("/view_student_information",
            dependencies=[Depends(is_current_user_admin)],
            response_model=List[StudentInformationCourses])
async def view_student_information(db: database_dependency,
                                   token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    students = get_students(db)

    return students


@router.get("/view_courses",
            dependencies=[Depends(is_current_user_admin)],
            response_model=List[CoursesForAdmin])
async def get_courses_for_admin(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    courses = get_courses(db)

    return courses


@router.post("/courses", dependencies=[Depends(is_current_user_admin)])
async def create_course_endpoint(
    request: CreateCourseRequest,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    """Create a new course. Returns Courseid and Coursename."""
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return create_course(db, request)


@router.get("/view_faculties",
            dependencies=[Depends(is_current_user_admin)],
            response_model=List[FacultyForAdmin])
async def get_courses_for_admin(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    faculties = get_faculties(db)

    return faculties


@router.get("/users",
            dependencies=[Depends(is_current_user_admin)],
            response_model=List[UserResponse])
async def get_users_list(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    users = get_all_users(db)
    return users


@router.put("/users/{user_id}/role",
            dependencies=[Depends(is_current_user_admin)])
async def update_role(user_id: int, 
                      request: UpdateRoleRequest,
                      db: database_dependency, 
                      token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)

    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorised method for user")

    result = update_user_role(db, user_id, request.role)
    return result


@router.get("/students_details",
            dependencies=[Depends(is_current_user_admin)],
            response_model=List[StudentCourseDetail])
async def get_students_details(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
         raise HTTPException(status_code=403, detail="Unauthorised method for user")
    
    return get_students_with_details(db)


@router.post("/assign_course_student",
             dependencies=[Depends(is_current_user_admin)])
async def assign_course_student(request: AssignCourseRequest,
                                db: database_dependency,
                                token: Annotated[str, Depends(oauth2_scheme)]):
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
         raise HTTPException(status_code=403, detail="Unauthorised method for user")
         
    return assign_course_to_student(db, request)


@router.get("/analytics", dependencies=[Depends(is_current_user_admin)])
async def admin_analytics(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
    """Dashboard stats: total users, courses, submissions in last 7/30 days."""
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return get_admin_analytics(db)


@router.post("/copy_course", dependencies=[Depends(is_current_user_admin)])
async def copy_course(
    request: CopyCourseRequest,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    """Copy course structure (assignments, quizzes, modules) to another course. No submissions."""
    decoded_token = decode_token(token=token)
    if decoded_token["userrole"] != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return copy_course_structure(db, request.source_course_id, request.target_course_id)