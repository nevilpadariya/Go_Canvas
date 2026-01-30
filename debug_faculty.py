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

print(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'DB'}") # Mask credentials
try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("✅ Database Connection SUCCESSFUL")
    connection.close()
except Exception as e:
    print(f"❌ Database Connection FAILED: {e}")
    exit(1)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def check_faculty_data():
    print("\n🔍 Checking Faculty Data & Queries...")
    
    # 1. Check for a known Faculty user (e.g., from seed data or generic check)
    print("\n--- Finding a Faculty Member ---")
    # Finding first faculty in users (assuming role mapping, but let's just query 'faculty' table directly if it exists, or via role)
    # Based on previous file reads, there is a 'faculty' table.
    
    fac_query = text('SELECT "Facultyid", "Facultyfirstname", "Facultylastname" FROM faculty LIMIT 1')
    try:
        faculty = db.execute(fac_query).fetchone()
        
        if faculty:
            print(f"✅ Found Faculty: ID {faculty.Facultyid} - {faculty.Facultyfirstname} {faculty.Facultylastname}")
            fid = faculty.Facultyid
            
            # 2. Test the specific Course Query (the one we fixed)
            print(f"\n--- Testing get_courses_by_faculty for ID {fid} ---")
            
            # This is the exact query from faculty_service.py (with my fixes)
            raw_query = text(
                """
            SELECT 
                c."Courseid", c."Coursename", cf."Coursesemester", f."Facultyfirstname", f."Facultylastname", f."Facultyid", cf."Coursepublished"
            FROM 
                coursefaculty cf
            JOIN 
                courses c ON cf."Coursecourseid" = c."Courseid"
            JOIN 
                faculty f ON cf."Coursefacultyid" = f."Facultyid"
            WHERE
                f."Facultyid" = :facultyid;"""
            )
            
            courses = db.execute(raw_query, {"facultyid": fid}).fetchall()
            
            if courses:
                print(f"✅ Query Successful! Found {len(courses)} courses:")
                for c in courses:
                    print(f"   - {c.Coursename} ({c.Coursesemester}) [Published: {c.Coursepublished}]")
            else:
                print("⚠️ Query ran successfully but returned no courses (Data might be empty for this faculty).")
                
        else:
            print("⚠️ Faculty table is empty.")
            
    except Exception as e:
        print(f"❌ Query FAILED. The fix might not be working or connection dropped.\nError: {e}")

if __name__ == "__main__":
    try:
        check_faculty_data()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()
