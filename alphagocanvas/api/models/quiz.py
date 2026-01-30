from pydantic import BaseModel
from typing import List, Optional


# Quiz Question Models
class QuizQuestionOption(BaseModel):
    Optiontext: str
    Iscorrect: bool
    Optionorder: int = 0

    class Config:
        from_attributes = True


class QuizQuestionOptionResponse(QuizQuestionOption):
    Optionid: int
    Questionid: int


class QuizQuestion(BaseModel):
    Questiontext: str
    Questiontype: str  # 'multiple_choice', 'true_false', 'short_answer', 'essay'
    Questionpoints: int = 1
    Questionorder: int = 0
    options: Optional[List[QuizQuestionOption]] = []

    class Config:
        from_attributes = True


class QuizQuestionResponse(BaseModel):
    Questionid: int
    Quizid: int
    Questiontext: str
    Questiontype: str
    Questionpoints: int
    Questionorder: int
    Createdat: Optional[str] = None
    options: List[QuizQuestionOptionResponse] = []

    class Config:
        from_attributes = True


# Quiz Creation/Update
class CreateQuizWithQuestions(BaseModel):
    Quizname: str
    Quizdescription: str
    Courseid: int
    questions: List[QuizQuestion]


class QuizDetailResponse(BaseModel):
    quizid: int
    quizname: str
    quizdescription: str
    Courseid: int
    questions: List[QuizQuestionResponse] = []

    class Config:
        from_attributes = True


# Quiz Attempt Models
class QuizAnswerSubmit(BaseModel):
    Questionid: int
    Selectedoptionid: Optional[int] = None  # For MC/TF
    Answertext: Optional[str] = None  # For short answer/essay


class QuizAttemptSubmit(BaseModel):
    Quizid: int
    answers: List[QuizAnswerSubmit]


class QuizAnswerResponse(BaseModel):
    Answerid: int
    Questionid: int
    Selectedoptionid: Optional[int] = None
    Answertext: Optional[str] = None
    Iscorrect: Optional[bool] = None
    Pointsearned: int = 0
    Feedback: Optional[str] = None

    class Config:
        from_attributes = True


class QuizAttemptResponse(BaseModel):
    Attemptid: int
    Quizid: int
    Studentid: int
    Attemptscore: Optional[int] = None
    Attemptmaxscore: Optional[int] = None
    Attemptgraded: bool = False
    Attemptstarted: Optional[str] = None
    Attemptsubmitted: Optional[str] = None
    Attemptfeedback: Optional[str] = None
    answers: List[QuizAnswerResponse] = []

    class Config:
        from_attributes = True


# For Faculty - Grading
class GradeQuizAnswer(BaseModel):
    Answerid: int
    Pointsearned: int
    Feedback: Optional[str] = None


class GradeQuizAttempt(BaseModel):
    Attemptid: int
    answers: List[GradeQuizAnswer]
    Attemptfeedback: Optional[str] = None
