# ﻿IAM (Identity and Access Management)

## Personas 

In our system, we recognize three major personas, each with specific roles:
  1. Student: Users enrolled in courses with access to learning materials and course registration.
  2. Admin: Users with comprehensive access to manage system settings, user roles, and content.
  3. Faculty: Users with permissions to manage courses, grades, and student interactions.

## User Type Differentiation 
For backend operations, user types are differentiated using the @UserRole field. This field helps in identifying the persona and providing the appropriate level of access.

## Authentication 

### Overview 
We utilize JWT token-based Authentication to manage user sessions and secure access.

#### Custom Annotation
@Authz To streamline the enablement or disablement of authentication checks, we have implemented a custom annotation: @Authz.

#### Working
When applied to a controller method, @Authz activates an Interceptor that checks for the presence of a valid JWT token. If the token is valid, the request proceeds; otherwise, access is denied.

#### Usage
To apply authentication to a particular controller method, simply annotate it with @Authz. The annotation processor not only validates the session token but also retrieves the current user associated with that session.

## Authorization 

Roles and permissions are assigned as follows:

1. Admin: Full access to all administrative functions.


       @router.get("/view_courses_by_faculty",dependencies=[Depends(is_current_user_admin)], response_model=List[AdminCoursesByFaculty])
       async def get_profile(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
         decoded_token = decode_token(token=token)


         if decoded_token["userrole"] != "Admin":
           raise HTTPException(status_code=401, detail="Unauthorised method")

         adminid = decoded_token.get("userid")

         courses_by_faculty = get_courses_by_faculty(db, adminid)
         return courses_by_faculty


2. Student: Access limited to course registration and material consumption.

       @router.get("/profile", dependencies=[Depends(is_current_user_student)], response_model=StudentInformation)
       async def get_profile(db: database_dependency, token: Annotated[str, Depends(oauth2_scheme)]):
         decoded_token = decode_token(token=token)

         if decoded_token["userrole"] != "Student":
           raise HTTPException(status_code=401, detail="Unauthorised method")

         student = get_student(decoded_token.get("userid"), db=db)
         return student


3. Faculty: Access to manage courses, submit grades, and interact with students.

       @router.get("/courses_taught",
       dependencies=[Depends(is_current_user_faculty)], response_model=List[CoursesByFaculty])
       async def get_profile(db: database_dependency, token: Annotated[str,Depends(oauth2_scheme)]):
         decoded_token = decode_token(token=token)
                 
         if decoded_token["userrole"] != "Faculty":
           raise HTTPException(status_code=401, detail="Unauthorised method")
                 
         # Retrieve faculty id from the decoded token
         facultyid = decoded_token.get("userid")
                 
         # get the courses faculty data from the database and return the object
          courses_faculty = get_courses_by_faculty(db, facultyid)
          return courses_faculty
