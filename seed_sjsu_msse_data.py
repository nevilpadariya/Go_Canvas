"""
Comprehensive seed script for SJSU MSSE LMS
Creates realistic test data including:
- SJSU MSSE courses
- Students and Faculty
- Course enrollments
- Assignments with submissions
- Quizzes with attempts
- Grades and feedback
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import hashlib

from alphagocanvas.database.models import (
    UserTable,
    StudentTable,
    FacultyTable,
    CourseTable,
    StudentEnrollmentTable,
    CourseFacultyTable,
    AssignmentTable,
    SubmissionTable,
    QuizTable,
    QuizQuestionTable,
    QuizQuestionOptionTable,
    QuizAttemptTable,
    QuizAnswerTable,
    AnnouncementTable,
    GradeTable,
)

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()


def seed_complete_sjsu_msse_data():
    """Seed complete SJSU MSSE test data"""
    
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 70)
        print("  🎓 SJSU MSSE Canvas LMS - Complete Data Seeding")
        print("=" * 70 + "\n")
        
        # ==================== USERS ====================
        print("👥 Creating Users...")
        
        # Admin
        admin_user = UserTable(
            Useremail="admin@sjsu.edu",
            Userpassword=hash_password("admin123"),
            Userrole="Admin"
        )
        db.add(admin_user)
        db.flush()
        print(f"  ✓ Admin: admin@sjsu.edu / admin123")
        
        # Faculty Users
        faculty_users = [
            {"email": "ben.reed@sjsu.edu", "first": "Dr. Ben", "last": "Reed", "dept": "Software Engineering"},
            {"email": "thomas.austin@sjsu.edu", "first": "Dr. Thomas", "last": "Austin", "dept": "Computer Science"},
            {"email": "robert.chun@sjsu.edu", "first": "Dr. Robert", "last": "Chun", "dept": "Software Engineering"},
            {"email": "william.andreopoulos@sjsu.edu", "first": "Dr. William", "last": "Andreopoulos", "dept": "Computer Science"},
        ]
        
        faculty_records = []
        for faculty_data in faculty_users:
            user = UserTable(
                Useremail=faculty_data["email"],
                Userpassword=hash_password("faculty123"),
                Userrole="Faculty"
            )
            db.add(user)
            db.flush()
            
            faculty = FacultyTable(
                Facultyid=user.Userid,
                Facultyfirstname=faculty_data["first"],
                Facultylastname=faculty_data["last"]
            )
            db.add(faculty)
            faculty_records.append(faculty)
            print(f"  ✓ Faculty: {faculty_data['email']} / faculty123")
        
        # Student Users
        student_users = [
            {"email": "john.smith@sjsu.edu", "first": "John", "last": "Smith"},
            {"email": "sarah.johnson@sjsu.edu", "first": "Sarah", "last": "Johnson"},
            {"email": "michael.chen@sjsu.edu", "first": "Michael", "last": "Chen"},
            {"email": "emily.davis@sjsu.edu", "first": "Emily", "last": "Davis"},
            {"email": "david.martinez@sjsu.edu", "first": "David", "last": "Martinez"},
            {"email": "jessica.wang@sjsu.edu", "first": "Jessica", "last": "Wang"},
        ]
        
        student_records = []
        for student_data in student_users:
            user = UserTable(
                Useremail=student_data["email"],
                Userpassword=hash_password("student123"),
                Userrole="Student"
            )
            db.add(user)
            db.flush()
            
            student = StudentTable(
                Studentid=user.Userid,
                Studentfirstname=student_data["first"],
                Studentlastname=student_data["last"],
                Studentcontactnumber="408-555-0200",
                Studentnotification=True
            )
            db.add(student)
            student_records.append(student)
            print(f"  ✓ Student: {student_data['email']} / student123")
        
        db.commit()
        print(f"\n✅ Created {len(faculty_records)} faculty and {len(student_records)} students\n")
        
        # ==================== COURSES ====================
        print("📚 Creating SJSU MSSE Courses...")
        
        courses_data = [
            {
                "code": "CMPE 272",
                "name": "Enterprise Software Platforms",
                "description": "Design and implementation of enterprise applications using modern frameworks and cloud platforms. Topics include microservices, containerization, and distributed systems.",
                "semester": "SPRING26"
            },
            {
                "code": "CMPE 275",
                "name": "Enterprise Application Development",
                "description": "Development of large-scale enterprise applications. Focus on application architecture, design patterns, RESTful APIs, and database integration.",
                "semester": "SPRING26"
            },
            {
                "code": "CMPE 255",
                "name": "Data Mining",
                "description": "Techniques and algorithms for discovering patterns in large datasets. Topics include classification, clustering, association rules, and neural networks.",
                "semester": "SPRING26"
            },
            {
                "code": "CMPE 202",
                "name": "Software Systems Engineering",
                "description": "Software development lifecycle, requirements analysis, design patterns, testing strategies, and agile methodologies.",
                "semester": "SPRING26"
            },
            {
                "code": "CMPE 295A",
                "name": "Master's Project I",
                "description": "First phase of the master's project. Students work on real-world software engineering problems under faculty supervision.",
                "semester": "SPRING26"
            },
            {
                "code": "CMPE 273",
                "name": "Enterprise Distributed Systems",
                "description": "Design and implementation of distributed systems. Topics include RPC, message queues, load balancing, and consistency models.",
                "semester": "FALL25"
            },
        ]
        
        course_records = []
        for course_data in courses_data:
            course = CourseTable(
                Coursename=f"{course_data['code']}: {course_data['name']}"
            )
            db.add(course)
            db.flush()
            course_records.append(course)
            print(f"  ✓ {course_data['code']}: {course_data['name']}")
        
        db.commit()
        print(f"\n✅ Created {len(course_records)} courses\n")
        
        # ==================== FACULTY ASSIGNMENTS ====================
        print("👨‍🏫 Assigning Faculty to Courses...")
        
        faculty_assignments = [
            (faculty_records[0], course_records[0]),  # Dr. Reed -> Enterprise Software
            (faculty_records[1], course_records[1]),  # Dr. Austin -> Enterprise App Dev
            (faculty_records[2], course_records[2]),  # Dr. Chun -> Data Mining
            (faculty_records[3], course_records[3]),  # Dr. Andreopoulos -> Software Systems
            (faculty_records[0], course_records[4]),  # Dr. Reed -> Master's Project
            (faculty_records[1], course_records[5]),  # Dr. Austin -> Distributed Systems
        ]
        
        for faculty, course in faculty_assignments:
            course_faculty = CourseFacultyTable(
                Coursecourseid=course.Courseid,
                Coursefacultyid=faculty.Facultyid,
                Coursesemester=course.Coursename.split(':')[0],
                Coursepublished=True,
                Coursedescription=course.Coursename
            )
            db.add(course_faculty)
            print(f"  ✓ {faculty.Facultyfirstname} {faculty.Facultylastname} → {course.Coursename}")
        
        db.commit()
        print()
        
        # ==================== STUDENT ENROLLMENTS ====================
        print("📝 Enrolling Students in Courses...")
        
        # Enroll all students in first 4 courses
        for student in student_records[:6]:
            for course in course_records[:4]:
                # Calculate grade (70-95 for variety)
                import random
                grade = random.randint(70, 95)
                
                enrollment = StudentEnrollmentTable(
                    Studentid=student.Studentid,
                    Courseid=course.Courseid,
                    EnrollmentSemester="SPRING26",
                    EnrollmentGrades=str(grade),
                    Facultyid=faculty_records[course_records.index(course) % len(faculty_records)].Facultyid
                )
                db.add(enrollment)
                
                # Also add to grades table
                grade_record = GradeTable(
                    Studentid=student.Studentid,
                    Courseid=course.Courseid
                )
                db.add(grade_record)
        
        db.commit()
        print(f"  ✓ Enrolled {len(student_records)} students in 4 courses each")
        print()
        
        # ==================== ASSIGNMENTS ====================
        print("📋 Creating Assignments...")
        
        assignments_data = [
            # CMPE 272 - Enterprise Software
            {
                "course_idx": 0,
                "name": "Microservices Architecture Design",
                "description": "Design a microservices architecture for an e-commerce platform. Include service boundaries, communication patterns, and deployment strategy."
            },
            {
                "course_idx": 0,
                "name": "Docker Containerization Lab",
                "description": "Containerize a multi-tier application using Docker. Create Dockerfile, docker-compose.yml, and document the deployment process."
            },
            {
                "course_idx": 0,
                "name": "Cloud Deployment Project",
                "description": "Deploy your microservices application to AWS or Azure. Use managed services and implement auto-scaling."
            },
            # CMPE 275 - Enterprise App Dev
            {
                "course_idx": 1,
                "name": "RESTful API Development",
                "description": "Develop a complete RESTful API for a booking system. Include authentication, validation, and error handling."
            },
            {
                "course_idx": 1,
                "name": "Database Design and ORM",
                "description": "Design a normalized database schema and implement it using JPA/Hibernate. Include relationships and transactions."
            },
            # CMPE 255 - Data Mining
            {
                "course_idx": 2,
                "name": "Classification Algorithms",
                "description": "Implement and compare Decision Trees, Random Forest, and SVM on a real dataset. Include performance metrics and analysis."
            },
            {
                "course_idx": 2,
                "name": "Clustering Analysis",
                "description": "Apply K-means and hierarchical clustering to customer segmentation data. Visualize results and interpret clusters."
            },
            # CMPE 202 - Software Systems
            {
                "course_idx": 3,
                "name": "Design Patterns Implementation",
                "description": "Implement Singleton, Factory, Observer, and Strategy patterns in a cohesive application. Document use cases."
            },
            {
                "course_idx": 3,
                "name": "Test-Driven Development",
                "description": "Develop a feature using TDD methodology. Include unit tests, integration tests, and test coverage report."
            },
        ]
        
        assignment_records = []
        for assignment_data in assignments_data:
            assignment = AssignmentTable(
                Assignmentname=assignment_data["name"],
                Assignmentdescription=assignment_data["description"],
                Courseid=course_records[assignment_data["course_idx"]].Courseid
            )
            db.add(assignment)
            db.flush()
            assignment_records.append(assignment)
        
        db.commit()
        print(f"  ✓ Created {len(assignment_records)} assignments across courses\n")
        
        # ==================== SUBMISSIONS ====================
        print("📤 Creating Sample Submissions...")
        
        submission_count = 0
        for assignment in assignment_records[:6]:  # First 6 assignments
            for student in student_records[:3]:  # First 3 students submit
                import random
                score = random.randint(75, 100)
                graded = random.choice([True, True, False])  # 2/3 graded
                
                submission = SubmissionTable(
                    Assignmentid=assignment.Assignmentid,
                    Studentid=student.Studentid,
                    Submissioncontent=f"Submission by {student.Studentfirstname} for {assignment.Assignmentname}. Implementation follows best practices...",
                    Submissionscore=str(score) if graded else None,
                    Submissiongraded=graded,
                    Submissionfeedback="Well done! Good implementation." if graded else None,
                    Submitteddate=(datetime.now() - timedelta(days=random.randint(1, 10))).isoformat()
                )
                db.add(submission)
                submission_count += 1
        
        db.commit()
        print(f"  ✓ Created {submission_count} submissions\n")
        
        # ==================== QUIZZES ====================
        print("🧠 Creating Quizzes...")
        
        quizzes_data = [
            {
                "course_idx": 0,
                "name": "Microservices Fundamentals Quiz",
                "description": "Test your knowledge of microservices architecture patterns",
                "questions": [
                    {
                        "text": "What is the main benefit of microservices architecture?",
                        "type": "multiple_choice",
                        "points": 2,
                        "options": [
                            {"text": "Single deployment", "correct": False},
                            {"text": "Independent scaling and deployment", "correct": True},
                            {"text": "Shared database", "correct": False},
                            {"text": "Monolithic structure", "correct": False}
                        ]
                    },
                    {
                        "text": "Docker containers share the host OS kernel.",
                        "type": "true_false",
                        "points": 1,
                        "options": [
                            {"text": "True", "correct": True},
                            {"text": "False", "correct": False}
                        ]
                    }
                ]
            },
            {
                "course_idx": 1,
                "name": "REST API Design Quiz",
                "description": "Assessment on RESTful API principles",
                "questions": [
                    {
                        "text": "Which HTTP method is idempotent?",
                        "type": "multiple_choice",
                        "points": 2,
                        "options": [
                            {"text": "POST", "correct": False},
                            {"text": "PUT", "correct": True},
                            {"text": "PATCH", "correct": False}
                        ]
                    },
                    {
                        "text": "Explain the difference between PUT and PATCH in REST APIs.",
                        "type": "short_answer",
                        "points": 3,
                        "options": []
                    }
                ]
            },
            {
                "course_idx": 2,
                "name": "Data Mining Concepts Quiz",
                "description": "Test on classification and clustering",
                "questions": [
                    {
                        "text": "Which algorithm is used for supervised learning?",
                        "type": "multiple_choice",
                        "points": 2,
                        "options": [
                            {"text": "K-means", "correct": False},
                            {"text": "Decision Trees", "correct": True},
                            {"text": "Hierarchical Clustering", "correct": False}
                        ]
                    }
                ]
            },
            {
                "course_idx": 3,
                "name": "Design Patterns Quiz",
                "description": "Assessment on software design patterns",
                "questions": [
                    {
                        "text": "The Singleton pattern ensures a class has only one instance.",
                        "type": "true_false",
                        "points": 1,
                        "options": [
                            {"text": "True", "correct": True},
                            {"text": "False", "correct": False}
                        ]
                    },
                    {
                        "text": "Describe when you would use the Observer pattern.",
                        "type": "essay",
                        "points": 5,
                        "options": []
                    }
                ]
            }
        ]
        
        quiz_records = []
        for quiz_data in quizzes_data:
            quiz = QuizTable(
                quizname=quiz_data["name"],
                quizdescription=quiz_data["description"],
                Courseid=course_records[quiz_data["course_idx"]].Courseid
            )
            db.add(quiz)
            db.flush()
            quiz_records.append(quiz)
            
            # Add questions
            for q_idx, question_data in enumerate(quiz_data["questions"]):
                question = QuizQuestionTable(
                    Quizid=quiz.quizid,
                    Questiontext=question_data["text"],
                    Questiontype=question_data["type"],
                    Questionpoints=question_data["points"],
                    Questionorder=q_idx,
                    Createdat=datetime.now().isoformat()
                )
                db.add(question)
                db.flush()
                
                # Add options if any
                for o_idx, option_data in enumerate(question_data["options"]):
                    option = QuizQuestionOptionTable(
                        Questionid=question.Questionid,
                        Optiontext=option_data["text"],
                        Iscorrect=option_data["correct"],
                        Optionorder=o_idx
                    )
                    db.add(option)
        
        db.commit()
        print(f"  ✓ Created {len(quiz_records)} quizzes with questions\n")
        
        # ==================== QUIZ ATTEMPTS ====================
        print("✍️ Creating Sample Quiz Attempts...")
        
        attempt_count = 0
        for quiz in quiz_records[:2]:  # First 2 quizzes
            for student in student_records[:3]:  # First 3 students attempt
                import random
                max_score = sum([q.Questionpoints for q in 
                               db.query(QuizQuestionTable).filter(
                                   QuizQuestionTable.Quizid == quiz.quizid
                               ).all()])
                score = random.randint(int(max_score * 0.7), max_score)
                
                attempt = QuizAttemptTable(
                    Quizid=quiz.quizid,
                    Studentid=student.Studentid,
                    Attemptscore=score,
                    Attemptmaxscore=max_score,
                    Attemptgraded=True,
                    Attemptstarted=(datetime.now() - timedelta(days=5)).isoformat(),
                    Attemptsubmitted=(datetime.now() - timedelta(days=5)).isoformat(),
                    Attemptfeedback="Good understanding of concepts!" if score >= max_score * 0.8 else "Review the topics covered."
                )
                db.add(attempt)
                attempt_count += 1
        
        db.commit()
        print(f"  ✓ Created {attempt_count} quiz attempts\n")
        
        # ==================== ANNOUNCEMENTS ====================
        print("📢 Creating Course Announcements...")
        
        announcements_data = [
            {
                "course_idx": 0,
                "title": "Welcome to Enterprise Software Platforms!",
                "content": "Welcome to CMPE 272! This semester we'll explore microservices, containers, and cloud platforms. Please review the syllabus and set up your development environment."
            },
            {
                "course_idx": 0,
                "title": "Assignment 1 Posted",
                "content": "Microservices Architecture Design assignment is now available. Due in 2 weeks. Start early!"
            },
            {
                "course_idx": 1,
                "title": "Welcome to Enterprise Application Development",
                "content": "Excited to have you in CMPE 275! We'll be building enterprise-grade applications this semester."
            },
            {
                "course_idx": 2,
                "title": "Data Mining Tools Setup",
                "content": "Please install Python, Jupyter, scikit-learn, and pandas for this course. Instructions in Canvas."
            },
        ]
        
        for announcement_data in announcements_data:
            announcement = AnnouncementTable(
                Courseid=str(course_records[announcement_data["course_idx"]].Courseid),
                Announcementname=announcement_data["title"],
                Announcementdescription=announcement_data["content"]
            )
            db.add(announcement)
        
        db.commit()
        print(f"  ✓ Created {len(announcements_data)} announcements\n")
        
        # ==================== SUMMARY ====================
        print("\n" + "=" * 70)
        print("  ✅ SJSU MSSE Data Seeding Complete!")
        print("=" * 70)
        print("\n📊 Summary:")
        print(f"  • Users: {1 + len(faculty_users) + len(student_users)}")
        print(f"  • Faculty: {len(faculty_records)}")
        print(f"  • Students: {len(student_records)}")
        print(f"  • Courses: {len(course_records)}")
        print(f"  • Assignments: {len(assignment_records)}")
        print(f"  • Submissions: {submission_count}")
        print(f"  • Quizzes: {len(quiz_records)}")
        print(f"  • Quiz Attempts: {attempt_count}")
        print(f"  • Announcements: {len(announcements_data)}")
        
        print("\n🔑 Test Credentials:")
        print("  Admin:   admin@sjsu.edu / admin123")
        print("  Faculty: ben.reed@sjsu.edu / faculty123")
        print("  Student: john.smith@sjsu.edu / student123")
        
        print("\n🚀 Ready to test!")
        print("  1. Login at http://localhost:3000")
        print("  2. Students can view courses, submit assignments, take quizzes")
        print("  3. Faculty can grade submissions")
        print("  4. View comprehensive grades dashboard")
        
        print("\n📚 SJSU MSSE Courses Created:")
        for course in course_records[:4]:
            print(f"  • {course.Coursename}")
        
        print("\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_complete_sjsu_msse_data()
