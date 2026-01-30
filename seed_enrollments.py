
import random
import sys
import os

# Add the project root to the python path
sys.path.append(os.getcwd())

from alphagocanvas.database.connection import SessionLocal
from alphagocanvas.database.models import StudentTable, CourseTable, StudentEnrollmentTable

def seed_enrollments():
    db = SessionLocal()
    try:
        students = db.query(StudentTable).all()
        courses = db.query(CourseTable).all()
        
        if not courses:
            print("No courses found. Skipping seeding.")
            return

        semesters = ["Spring24", "Fall24"]
        
        for student in students:
            for semester in semesters:
                # Pick a random course
                course = random.choice(courses)
                
                # Check if already enrolled
                existing = db.query(StudentEnrollmentTable).filter(
                    StudentEnrollmentTable.Studentid == student.Studentid,
                    StudentEnrollmentTable.Courseid == course.Courseid
                ).first()
                
                if not existing:
                    new_enrollment = StudentEnrollmentTable(
                        Studentid=student.Studentid,
                        Courseid=course.Courseid,
                        EnrollmentSemester=semester,
                        EnrollmentGrades=None,
                        Facultyid=None
                    )
                    db.add(new_enrollment)
                    print(f"Enrolled Student {student.Studentid} in Course {course.Courseid} for {semester}")
                else:
                    print(f"Student {student.Studentid} already enrolled in Course {course.Courseid}")
        
        db.commit()
        print("Seeding completed successfully.")
        
    except Exception as e:
        print(f"Error seeding enrollments: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_enrollments()
