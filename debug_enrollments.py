import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    exit(1)

print(f"Connecting to: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def check_enrollments():
    print("\n🔍 Checking Student Enrollments...")
    
    # 1. Check recent enrollments
    print("\n--- Recent Enrollments (Last 5) ---")
    query = text("""
        SELECT se."Enrollmentid", s."Studentfirstname", s."Studentlastname", c."Coursename", se."EnrollmentSemester"
        FROM studentenrollment se
        JOIN student s ON se."Studentid" = s."Studentid"
        JOIN courses c ON se."Courseid" = c."Courseid"
        ORDER BY se."Enrollmentid" DESC
        LIMIT 5;
    """)
    results = db.execute(query).fetchall()
    
    if not results:
        print("No enrollments found.")
    else:
        for row in results:
            print(f"ID: {row[0]} | Student: {row[1]} {row[2]} | Course: {row[3]} | Term: {row[4]}")

    # 2. Check Specific Student (John Smith)
    print("\n--- Checking John Smith (john.smith@sjsu.edu) ---")
    student_query = text("SELECT \"Studentid\" FROM student JOIN usertable ON student.\"Studentid\" = usertable.\"Userid\" WHERE usertable.\"Useremail\" = 'john.smith@sjsu.edu'")
    student = db.execute(student_query).fetchone()
    
    if student:
        student_id = student[0]
        print(f"Found Student ID: {student_id}")
        
        enroll_query = text("""
            SELECT c."Coursename", c."Courseid", se."EnrollmentSemester"
            FROM studentenrollment se
            JOIN courses c ON se."Courseid" = c."Courseid"
            WHERE se."Studentid" = :sid
        """)
        enrollments = db.execute(enroll_query, {"sid": student_id}).fetchall()
        
        if enrollments:
            print(f"Enrollments for John Smith:")
            for e in enrollments:
                print(f" - {e[0]} (ID: {e[1]}) [{e[2]}]")
        else:
            print("❌ No enrollments found for John Smith")
            
        # 3. Debug the Student Dashboard Query specifically
        print("\n--- Testing Student Dashboard Query ---")
        dashboard_query = text("""
            SELECT
                c."Courseid",
                c."Coursename",
                se."EnrollmentSemester",
                cf."Coursepublished",
                cf."Coursedescription"
            FROM
                courses c
            JOIN
                studentenrollment se ON c."Courseid" = se."Courseid"
            LEFT JOIN
                coursefaculty cf ON c."Courseid" = cf."Coursecourseid"
            WHERE
                se."Studentid" = :student_id;
        """)
        dash_results = db.execute(dashboard_query, {"student_id": student_id}).fetchall()
        print(f"Dashboard Query returns {len(dash_results)} rows")
        for r in dash_results:
             print(f" - {r.Coursename} (Published: {r.Coursepublished})")
             
    else:
        print("❌ Student John Smith not found")

if __name__ == "__main__":
    try:
        check_enrollments()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()
