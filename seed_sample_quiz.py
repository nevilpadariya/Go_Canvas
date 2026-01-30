"""
Seed sample quiz data into the database
This script creates a sample quiz with different question types for testing
"""

import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alphagocanvas.database.models import (
    QuizTable,
    QuizQuestionTable,
    QuizQuestionOptionTable,
)

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def seed_sample_quiz():
    """Create a sample quiz with various question types"""
    
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 60)
        print("  Seeding Sample Quiz Data")
        print("=" * 60 + "\n")
        
        # Create a sample quiz for course ID 1
        print("📝 Creating sample quiz...")
        sample_quiz = QuizTable(
            quizname="Python Basics Quiz",
            quizdescription="Test your knowledge of Python fundamentals",
            Courseid=1  # Assumes course with ID 1 exists
        )
        db.add(sample_quiz)
        db.flush()
        
        quiz_id = sample_quiz.quizid
        print(f"✅ Created quiz: {sample_quiz.quizname} (ID: {quiz_id})\n")
        
        # Question 1: Multiple Choice
        print("➕ Adding multiple choice question...")
        q1 = QuizQuestionTable(
            Quizid=quiz_id,
            Questiontext="What is the output of: print(type([]))?",
            Questiontype="multiple_choice",
            Questionpoints=2,
            Questionorder=1,
            Createdat=datetime.now().isoformat()
        )
        db.add(q1)
        db.flush()
        
        # Add options for Q1
        options_q1 = [
            QuizQuestionOptionTable(
                Questionid=q1.Questionid,
                Optiontext="<class 'dict'>",
                Iscorrect=False,
                Optionorder=1
            ),
            QuizQuestionOptionTable(
                Questionid=q1.Questionid,
                Optiontext="<class 'list'>",
                Iscorrect=True,
                Optionorder=2
            ),
            QuizQuestionOptionTable(
                Questionid=q1.Questionid,
                Optiontext="<class 'tuple'>",
                Iscorrect=False,
                Optionorder=3
            ),
            QuizQuestionOptionTable(
                Questionid=q1.Questionid,
                Optiontext="<class 'set'>",
                Iscorrect=False,
                Optionorder=4
            ),
        ]
        for opt in options_q1:
            db.add(opt)
        print(f"   ✓ Question 1: Multiple choice with 4 options")
        
        # Question 2: True/False
        print("➕ Adding true/false question...")
        q2 = QuizQuestionTable(
            Quizid=quiz_id,
            Questiontext="Python is a compiled language.",
            Questiontype="true_false",
            Questionpoints=1,
            Questionorder=2,
            Createdat=datetime.now().isoformat()
        )
        db.add(q2)
        db.flush()
        
        # Add options for Q2
        options_q2 = [
            QuizQuestionOptionTable(
                Questionid=q2.Questionid,
                Optiontext="True",
                Iscorrect=False,
                Optionorder=1
            ),
            QuizQuestionOptionTable(
                Questionid=q2.Questionid,
                Optiontext="False",
                Iscorrect=True,
                Optionorder=2
            ),
        ]
        for opt in options_q2:
            db.add(opt)
        print(f"   ✓ Question 2: True/False")
        
        # Question 3: Multiple Choice
        print("➕ Adding another multiple choice question...")
        q3 = QuizQuestionTable(
            Quizid=quiz_id,
            Questiontext="Which of the following is used to define a function in Python?",
            Questiontype="multiple_choice",
            Questionpoints=2,
            Questionorder=3,
            Createdat=datetime.now().isoformat()
        )
        db.add(q3)
        db.flush()
        
        options_q3 = [
            QuizQuestionOptionTable(
                Questionid=q3.Questionid,
                Optiontext="function",
                Iscorrect=False,
                Optionorder=1
            ),
            QuizQuestionOptionTable(
                Questionid=q3.Questionid,
                Optiontext="def",
                Iscorrect=True,
                Optionorder=2
            ),
            QuizQuestionOptionTable(
                Questionid=q3.Questionid,
                Optiontext="func",
                Iscorrect=False,
                Optionorder=3
            ),
            QuizQuestionOptionTable(
                Questionid=q3.Questionid,
                Optiontext="define",
                Iscorrect=False,
                Optionorder=4
            ),
        ]
        for opt in options_q3:
            db.add(opt)
        print(f"   ✓ Question 3: Multiple choice with 4 options")
        
        # Question 4: Short Answer
        print("➕ Adding short answer question...")
        q4 = QuizQuestionTable(
            Quizid=quiz_id,
            Questiontext="What does 'PEP' stand for in Python PEP 8?",
            Questiontype="short_answer",
            Questionpoints=2,
            Questionorder=4,
            Createdat=datetime.now().isoformat()
        )
        db.add(q4)
        print(f"   ✓ Question 4: Short answer (requires manual grading)")
        
        # Question 5: Essay
        print("➕ Adding essay question...")
        q5 = QuizQuestionTable(
            Quizid=quiz_id,
            Questiontext="Explain the difference between a list and a tuple in Python. Provide examples of when you would use each.",
            Questiontype="essay",
            Questionpoints=5,
            Questionorder=5,
            Createdat=datetime.now().isoformat()
        )
        db.add(q5)
        print(f"   ✓ Question 5: Essay (requires manual grading)")
        
        # Commit all changes
        db.commit()
        
        print("\n" + "=" * 60)
        print("✅ Sample quiz created successfully!")
        print("=" * 60)
        print(f"\nQuiz Details:")
        print(f"  Name: {sample_quiz.quizname}")
        print(f"  ID: {quiz_id}")
        print(f"  Total Questions: 5")
        print(f"  Total Points: 12")
        print(f"  Auto-gradable: 3 questions (5 points)")
        print(f"  Manual grading: 2 questions (7 points)")
        print(f"\nQuestion Types:")
        print(f"  - 2 Multiple Choice (2 points each)")
        print(f"  - 1 True/False (1 point)")
        print(f"  - 1 Short Answer (2 points)")
        print(f"  - 1 Essay (5 points)")
        print("\nTo take this quiz:")
        print(f"  1. Login as a student")
        print(f"  2. Navigate to Course ID 1")
        print(f"  3. Click on 'Python Basics Quiz'")
        print(f"  4. Answer questions and submit")
        print("\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating sample quiz: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_quiz()
