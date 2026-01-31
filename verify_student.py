#!/usr/bin/env python3
"""
Verify the sample student was added to the database
"""
import sys
sys.path.insert(0, '/Users/nevilsmac/Downloads/Projects/Go_Canvas')

from alphagocanvas.database.connection import SessionLocal
from alphagocanvas.database.models import UserTable, StudentTable

def verify_student():
    """Verify the student exists in both tables"""
    db = SessionLocal()
    
    try:
        # Check UserTable
        user = db.query(UserTable).filter(UserTable.Useremail == "student@example.com").first()
        if user:
            print("✓ User found in UserTable:")
            print(f"  User ID: {user.Userid}")
            print(f"  Email: {user.Useremail}")
            print(f"  Role: {user.Userrole}")
        else:
            print("✗ User NOT found in UserTable")
            return False
        
        # Check StudentTable
        student = db.query(StudentTable).filter(StudentTable.Studentid == user.Userid).first()
        if student:
            print("\n✓ Student found in StudentTable:")
            print(f"  Student ID: {student.Studentid}")
            print(f"  Name: {student.Studentfirstname} {student.Studentlastname}")
        else:
            print("\n✗ Student NOT found in StudentTable")
            return False
        
        print("\n✓ Database connection is working!")
        print("\nYou can now login with:")
        print(f"  Email: student@example.com")
        print(f"  Student ID: {user.Userid}")
        print(f"  Password: student123")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error verifying student: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = verify_student()
    sys.exit(0 if success else 1)
