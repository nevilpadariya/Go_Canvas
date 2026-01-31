from datetime import datetime
from alphagocanvas.database import database_dependency
from alphagocanvas.database.models import UserTable, StudentTable, FacultyTable
from alphagocanvas.api.models.signup import SignupRequest
from fastapi import HTTPException
from sqlalchemy import func


def generate_id(db: database_dependency, role: str) -> int:
    """
    Generate a unique ID in format YYMMXXX (e.g., 2601001)
    - YY: Last 2 digits of year (26 for 2026)
    - MM: Month (01-12)
    - XXX: Sequential number from 001-999
    
    :param db: database dependency
    :param role: 'Student' or 'Faculty'
    :return: Generated ID
    """
    # Get current year and month
    now = datetime.now()
    year_month_prefix = int(f"{now.year % 100:02d}{now.month:02d}")  # YYMM as integer
    
    # Determine which table to query
    table = StudentTable if role == "Student" else FacultyTable
    id_column = table.Studentid if role == "Student" else table.Facultyid
    
    # Find the maximum ID for the current month prefix
    # IDs are in format YYMMXXX, so we need to find IDs starting with current YYMM
    min_id = year_month_prefix * 1000  # e.g., 2601000
    max_id = min_id + 999  # e.g., 2601999
    
    # Get the highest ID in the current month range
    highest_id = db.query(func.max(id_column)).filter(
        id_column >= min_id,
        id_column <= max_id
    ).scalar()
    
    # Generate new ID
    if highest_id is None:
        # First ID of this month
        new_id = min_id + 1  # e.g., 2601001
    else:
        # Increment the last ID
        new_id = highest_id + 1
        
    # Check if we've exceeded the limit for this month (999 users)
    if new_id > max_id:
        raise HTTPException(
            status_code=500,
            detail=f"Maximum {role} registrations for this month (999) exceeded"
        )
    
    return new_id


def create_user(signup_data: SignupRequest, db: database_dependency):
    """
    Create a new user account with auto-generated ID
    
    :param signup_data: Signup request data
    :param db: database dependency
    :return: Created user information including assigned ID
    """
    # Check if email already exists
    existing_user = db.query(UserTable).filter(
        UserTable.Useremail == signup_data.Useremail
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Generate unique ID based on role
    assigned_id = generate_id(db, signup_data.Userrole)
    
    try:
        # Create entry in UserTable
        new_user = UserTable(
            Userid=assigned_id,
            Useremail=signup_data.Useremail,
            Userpassword=signup_data.Userpassword,  # TODO: Hash password with bcrypt
            Userrole=signup_data.Userrole
        )
        db.add(new_user)
        
        # Create entry in role-specific table
        if signup_data.Userrole == "Student":
            new_student = StudentTable(
                Studentid=assigned_id,
                Studentfirstname=signup_data.Userfirstname,
                Studentlastname=signup_data.Userlastname,
                Studentcontactnumber="",  # Optional, can be updated later
                Studentnotification=True  # Default to enabled
            )
            db.add(new_student)
        else:  # Faculty
            new_faculty = FacultyTable(
                Facultyid=assigned_id,
                Facultyfirstname=signup_data.Userfirstname,
                Facultylastname=signup_data.Userlastname
            )
            db.add(new_faculty)
        
        # Commit the transaction
        db.commit()
        db.refresh(new_user)
        
        return {
            "userid": new_user.Userid,
            "assigned_id": assigned_id,
            "useremail": new_user.Useremail,
            "userrole": new_user.Userrole
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )


def get_user(username: str, db: database_dependency):
    """
    Get user by email or ID
    
    :param username: email or Student_id/Faculty_id
    :param db: database_dependency
    :return: retrieved user from the database
    """
    print(f"🔍 Database query for user: {username}")
    # Check if username is an email (contains '@')
    if '@' in username:
        user = db.query(UserTable).filter(UserTable.Useremail == username).first()
    else:
        # Try to convert to integer ID
        try:
            user_id = int(username)
            user = db.query(UserTable).filter(UserTable.Userid == user_id).first()
        except ValueError:
            # Not a valid ID format
            return None
    
    print(f"✅ Database query complete for user: {username}")
    return user
