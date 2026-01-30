from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from alphagocanvas.database.models import (
    QuizTable,
    QuizQuestionTable,
    QuizQuestionOptionTable,
    QuizAttemptTable,
    QuizAnswerTable,
    StudentTable,
)
from alphagocanvas.api.models.quiz import (
    CreateQuizWithQuestions,
    QuizQuestionResponse,
    QuizQuestionOptionResponse,
    QuizAttemptSubmit,
    QuizAttemptResponse,
    QuizAnswerResponse,
    GradeQuizAttempt,
)


def create_quiz_with_questions(quiz_data: CreateQuizWithQuestions, db: Session):
    """Create a quiz with multiple questions and options"""
    
    # Create quiz
    new_quiz = QuizTable(
        quizname=quiz_data.Quizname,
        quizdescription=quiz_data.Quizdescription,
        Courseid=quiz_data.Courseid
    )
    db.add(new_quiz)
    db.flush()  # Get quiz ID
    
    # Create questions
    for question_data in quiz_data.questions:
        new_question = QuizQuestionTable(
            Quizid=new_quiz.quizid,
            Questiontext=question_data.Questiontext,
            Questiontype=question_data.Questiontype,
            Questionpoints=question_data.Questionpoints,
            Questionorder=question_data.Questionorder,
            Createdat=datetime.now().isoformat()
        )
        db.add(new_question)
        db.flush()  # Get question ID
        
        # Create options for MC/TF questions
        if question_data.options and question_data.Questiontype in ['multiple_choice', 'true_false']:
            for option_data in question_data.options:
                new_option = QuizQuestionOptionTable(
                    Questionid=new_question.Questionid,
                    Optiontext=option_data.Optiontext,
                    Iscorrect=option_data.Iscorrect,
                    Optionorder=option_data.Optionorder
                )
                db.add(new_option)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz


def get_quiz_with_questions(quiz_id: int, db: Session, include_answers: bool = False):
    """Get quiz details with questions and options"""
    
    quiz = db.query(QuizTable).filter(QuizTable.quizid == quiz_id).first()
    if not quiz:
        return None
    
    questions = db.query(QuizQuestionTable).filter(
        QuizQuestionTable.Quizid == quiz_id
    ).order_by(QuizQuestionTable.Questionorder).all()
    
    quiz_questions = []
    for question in questions:
        options = db.query(QuizQuestionOptionTable).filter(
            QuizQuestionOptionTable.Questionid == question.Questionid
        ).order_by(QuizQuestionOptionTable.Optionorder).all()
        
        # Hide correct answers for students unless include_answers is True
        option_responses = []
        for opt in options:
            option_response = QuizQuestionOptionResponse(
                Optionid=opt.Optionid,
                Questionid=opt.Questionid,
                Optiontext=opt.Optiontext,
                Iscorrect=opt.Iscorrect if include_answers else False,
                Optionorder=opt.Optionorder
            )
            option_responses.append(option_response)
        
        question_response = QuizQuestionResponse(
            Questionid=question.Questionid,
            Quizid=question.Quizid,
            Questiontext=question.Questiontext,
            Questiontype=question.Questiontype,
            Questionpoints=question.Questionpoints,
            Questionorder=question.Questionorder,
            Createdat=question.Createdat,
            options=option_responses
        )
        quiz_questions.append(question_response)
    
    return {
        "quizid": quiz.quizid,
        "quizname": quiz.quizname,
        "quizdescription": quiz.quizdescription,
        "Courseid": quiz.Courseid,
        "questions": quiz_questions
    }


def submit_quiz_attempt(student_id: int, attempt_data: QuizAttemptSubmit, db: Session):
    """Submit a quiz attempt with answers"""
    
    # Create attempt
    new_attempt = QuizAttemptTable(
        Quizid=attempt_data.Quizid,
        Studentid=student_id,
        Attemptstarted=datetime.now().isoformat(),
        Attemptsubmitted=datetime.now().isoformat(),
        Attemptgraded=False
    )
    db.add(new_attempt)
    db.flush()
    
    total_score = 0
    max_score = 0
    
    # Process each answer
    for answer_data in attempt_data.answers:
        question = db.query(QuizQuestionTable).filter(
            QuizQuestionTable.Questionid == answer_data.Questionid
        ).first()
        
        if not question:
            continue
        
        max_score += question.Questionpoints
        
        # Auto-grade MC and TF questions
        is_correct = None
        points_earned = 0
        
        if question.Questiontype in ['multiple_choice', 'true_false'] and answer_data.Selectedoptionid:
            selected_option = db.query(QuizQuestionOptionTable).filter(
                QuizQuestionOptionTable.Optionid == answer_data.Selectedoptionid
            ).first()
            
            if selected_option and selected_option.Iscorrect:
                is_correct = True
                points_earned = question.Questionpoints
                total_score += points_earned
            else:
                is_correct = False
                points_earned = 0
        
        # Create answer record
        new_answer = QuizAnswerTable(
            Attemptid=new_attempt.Attemptid,
            Questionid=answer_data.Questionid,
            Selectedoptionid=answer_data.Selectedoptionid,
            Answertext=answer_data.Answertext,
            Iscorrect=is_correct,
            Pointsearned=points_earned
        )
        db.add(new_answer)
    
    # Update attempt scores
    new_attempt.Attemptscore = total_score
    new_attempt.Attemptmaxscore = max_score
    
    # Mark as graded if all questions are auto-gradable
    all_auto_gradable = all(
        db.query(QuizQuestionTable).filter(
            QuizQuestionTable.Questionid == ans.Questionid,
            QuizQuestionTable.Questiontype.in_(['multiple_choice', 'true_false'])
        ).first() is not None
        for ans in attempt_data.answers
    )
    
    if all_auto_gradable:
        new_attempt.Attemptgraded = True
    
    db.commit()
    db.refresh(new_attempt)
    return new_attempt


def get_student_quiz_attempts(student_id: int, quiz_id: int, db: Session):
    """Get all attempts by a student for a specific quiz"""
    
    attempts = db.query(QuizAttemptTable).filter(
        QuizAttemptTable.Studentid == student_id,
        QuizAttemptTable.Quizid == quiz_id
    ).all()
    
    return attempts


def get_quiz_attempt_details(attempt_id: int, db: Session):
    """Get detailed attempt with answers"""
    
    attempt = db.query(QuizAttemptTable).filter(
        QuizAttemptTable.Attemptid == attempt_id
    ).first()
    
    if not attempt:
        return None
    
    answers = db.query(QuizAnswerTable).filter(
        QuizAnswerTable.Attemptid == attempt_id
    ).all()
    
    answer_responses = [
        QuizAnswerResponse(
            Answerid=ans.Answerid,
            Questionid=ans.Questionid,
            Selectedoptionid=ans.Selectedoptionid,
            Answertext=ans.Answertext,
            Iscorrect=ans.Iscorrect,
            Pointsearned=ans.Pointsearned,
            Feedback=ans.Feedback
        )
        for ans in answers
    ]
    
    return QuizAttemptResponse(
        Attemptid=attempt.Attemptid,
        Quizid=attempt.Quizid,
        Studentid=attempt.Studentid,
        Attemptscore=attempt.Attemptscore,
        Attemptmaxscore=attempt.Attemptmaxscore,
        Attemptgraded=attempt.Attemptgraded,
        Attemptstarted=attempt.Attemptstarted,
        Attemptsubmitted=attempt.Attemptsubmitted,
        Attemptfeedback=attempt.Attemptfeedback,
        answers=answer_responses
    )


def grade_quiz_attempt(grade_data: GradeQuizAttempt, db: Session):
    """Faculty grades a quiz attempt (for essay/short answer questions)"""
    
    attempt = db.query(QuizAttemptTable).filter(
        QuizAttemptTable.Attemptid == grade_data.Attemptid
    ).first()
    
    if not attempt:
        return None
    
    total_score = 0
    
    # Update individual answer grades
    for answer_grade in grade_data.answers:
        answer = db.query(QuizAnswerTable).filter(
            QuizAnswerTable.Answerid == answer_grade.Answerid
        ).first()
        
        if answer:
            answer.Pointsearned = answer_grade.Pointsearned
            answer.Feedback = answer_grade.Feedback
            total_score += answer_grade.Pointsearned
    
    # Update attempt
    attempt.Attemptscore = total_score
    attempt.Attemptgraded = True
    attempt.Attemptfeedback = grade_data.Attemptfeedback
    
    db.commit()
    db.refresh(attempt)
    return attempt


def get_all_quiz_attempts_for_course(quiz_id: int, db: Session):
    """Get all student attempts for a quiz (for faculty grading)"""
    
    attempts = db.query(QuizAttemptTable, StudentTable).join(
        StudentTable, QuizAttemptTable.Studentid == StudentTable.Studentid
    ).filter(
        QuizAttemptTable.Quizid == quiz_id
    ).all()
    
    return attempts
