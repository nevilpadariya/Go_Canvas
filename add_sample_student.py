#!/usr/bin/env python3
"""
Script to add a sample student user to the database
"""
import sys
sys.path.insert(0, '/Users/nevilsmac/Downloads/Projects/Go_Canvas')

from datetime import datetime
from sqlalchemy import func
from alphagocanvas.database.connection import SessionLocal, ENGINE
from alphagocanvas.database.models import UserTable, StudentTable

def get_month_range():
    """Get the min and max ID range for current month"""
    now = datetime.now()
    year_month_prefix = int(f"{now.year % 100:02d}{now.month:02d}")  # e.g., 2601
    min_id = year_month_prefix * 1000  # e.g., 2601000
    max_id = min_id + 999  # e.g., 2601999
    return min_id, max_id

def find_next_available_id(db, min_id, max_id):
    """Find the next available student ID"""
    # Check both UserTable and StudentTable for the highest ID
    user_highest = db.query(func.max(UserTable.Userid)).filter(
        UserTable.Userid >= min_id,
        UserTable.Userid <= max_id
    ).scalar()
    
    student_highest = db.query(func.max(StudentTable.Studentid)).filter(
        StudentTable.Studentid >= min_id,
        StudentTable.Studentid <= max_id
    ).scalar()
    
    # Use the highest of both
    highest_id = max(user_highest or 0, student_highest or 0)
    
    if highest_id == 0:
        return min_id + 1  # First student of this month
    
    # Check if the next ID is available
    next_id = highest_id + 1
    while next_id <= max_id:
        existing_user = db.query(UserTable).filter(UserTable.Userid == next_id).first()
        existing_student = db.query(StudentTable).filter(StudentTable.Studentid == next_id).first()
        if not existing_user and not existing_student:
            return next_id
        next_id += 1
    
    raise Exception("Maximum student registrations for this month exceeded")

def add_sample_student():
    """Add a sample student user"""
    db = SessionLocal()
    
    try:
        min_id, max_id = get_month_range()
        
        # Sample student data
        student_id = find_next_available_id(db, min_id, max_id)
        email = "student@example.com"
        password = "student123"  # In production, this should be hashed
        first_name = "John"
        last_name = "Doe"
        
        print(f"Generated Student ID: {student_id}")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Name: {first_name} {last_name}")
        
        # Check if email already exists
        existing_user = db.query(UserTable).filter(UserTable.Useremail == email).first()
        if existing_user:
            print(f"\nUser with email {email} already exists!")
            print(f"Existing Student ID: {existing_user.Userid}")
            return
        
        # Create UserTable entry
        new_user = UserTable(
            Userid=student_id,
            Useremail=email,
            Userpassword=password,
            Userrole="Student"
        )
        db.add(new_user)
        
        # Create StudentTable entry
        new_student = StudentTable(
            Studentid=student_id,
            Studentfirstname=first_name,
            Studentlastname=last_name,
            Studentcontactnumber="",
            Studentnotification=True
        )
        db.add(new_student)
        
        # Commit the transaction
        db.commit()
        
        print("\n✓ Sample student added successfully!")
        print(f"\nLogin credentials:")
        print(f"  Email/ID: {email} (or {student_id})")
        print(f"  Password: {password}")
        
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error adding student: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        add_sample_student()
    except Exception as e:
        print(f"\nFailed to add sample student: {e}")
        sys.exit(1)
