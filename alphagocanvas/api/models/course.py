from pydantic import BaseModel


class CourseFacultySemesterRequest(BaseModel):
    Courseid: int
    Facultyid: int
    Coursesemester: str


class CourseFacultySemesterResponse(BaseModel):
    Success: str


class CopyCourseRequest(BaseModel):
    source_course_id: int
    target_course_id: int
