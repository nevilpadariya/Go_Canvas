from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.quiz import (
    CreateQuizWithQuestions,
    QuizDetailResponse,
    QuizAttemptSubmit,
    QuizAttemptResponse,
    GradeQuizAttempt,
)
from alphagocanvas.api.services.quiz_service import (
    create_quiz_with_questions,
    get_quiz_with_questions,
    submit_quiz_attempt,
    get_student_quiz_attempts,
    get_quiz_attempt_details,
    grade_quiz_attempt,
    get_all_quiz_attempts_for_course,
)
from alphagocanvas.api.utils.auth import decode_token
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/quiz", tags=["quiz"])


# Faculty Endpoints

@router.post("/create", dependencies=[])
async def create_quiz(
    quiz_data: CreateQuizWithQuestions,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Faculty: Create a new quiz with questions"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can create quizzes")
    
    try:
        quiz = create_quiz_with_questions(quiz_data, db)
        return {
            "message": "Quiz created successfully",
            "quizid": quiz.quizid,
            "quizname": quiz.quizname
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create quiz: {str(e)}")


@router.get("/faculty/{quiz_id}/attempts")
async def get_quiz_attempts_for_grading(
    quiz_id: int,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Faculty: Get all student attempts for a quiz"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view attempts")
    
    attempts = get_all_quiz_attempts_for_course(quiz_id, db)
    return attempts


@router.post("/grade")
async def grade_quiz(
    grade_data: GradeQuizAttempt,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Faculty: Grade a quiz attempt"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can grade quizzes")
    
    attempt = grade_quiz_attempt(grade_data, db)
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    return {
        "message": "Quiz graded successfully",
        "attemptid": attempt.Attemptid,
        "score": attempt.Attemptscore,
        "maxscore": attempt.Attemptmaxscore
    }


# Student Endpoints

@router.get("/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz_details(
    quiz_id: int,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Student: Get quiz details to take the quiz"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Student":
        raise HTTPException(status_code=403, detail="Only students can take quizzes")
    
    # Don't include correct answers for students taking quiz
    quiz = get_quiz_with_questions(quiz_id, db, include_answers=False)
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return quiz


@router.post("/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    attempt_data: QuizAttemptSubmit,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Student: Submit quiz attempt"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Student":
        raise HTTPException(status_code=403, detail="Only students can submit quizzes")
    
    student_id = decoded_token.get("userid")
    
    try:
        attempt = submit_quiz_attempt(student_id, attempt_data, db)
        attempt_details = get_quiz_attempt_details(attempt.Attemptid, db)
        return attempt_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")


@router.get("/student/{quiz_id}/attempts", response_model=List[QuizAttemptResponse])
async def get_my_quiz_attempts(
    quiz_id: int,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Student: Get own attempts for a quiz"""
    decoded_token = decode_token(token=token)
    
    if decoded_token["userrole"] != "Student":
        raise HTTPException(status_code=403, detail="Only students can view their attempts")
    
    student_id = decoded_token.get("userid")
    attempts = get_student_quiz_attempts(student_id, quiz_id, db)
    
    attempt_details = []
    for attempt in attempts:
        details = get_quiz_attempt_details(attempt.Attemptid, db)
        if details:
            attempt_details.append(details)
    
    return attempt_details


@router.get("/attempt/{attempt_id}", response_model=QuizAttemptResponse)
async def get_attempt_details(
    attempt_id: int,
    db: database_dependency,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Get detailed attempt results"""
    decoded_token = decode_token(token=token)
    student_id = decoded_token.get("userid")
    
    attempt_details = get_quiz_attempt_details(attempt_id, db)
    
    if not attempt_details:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Verify student owns this attempt or is faculty
    if decoded_token["userrole"] == "Student" and attempt_details.Studentid != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attempt")
    
    return attempt_details
