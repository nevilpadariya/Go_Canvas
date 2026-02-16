import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, CheckCircle, Clock, Trophy, AlertCircle } from 'lucide-react';

import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MainContentWrapper } from "@/components/MainContentWrapper";

interface QuizOption {
  Optionid: number;
  Optiontext: string;
  Iscorrect: boolean;
  Optionorder: number;
}

interface QuizQuestion {
  Questionid: number;
  Questiontext: string;
  Questiontype: string;
  Questionpoints: number;
  Questionorder: number;
  options: QuizOption[];
}

interface QuizDetail {
  quizid: number;
  quizname: string;
  quizdescription: string;
  Courseid: number;
  questions: QuizQuestion[];
}

interface Answer {
  Questionid: number;
  Selectedoptionid?: number;
  Answertext?: string;
}

interface AttemptResult {
  Attemptid: number;
  Attemptscore: number | null;
  Attemptmaxscore: number | null;
  Attemptgraded: boolean;
  Attemptfeedback: string | null;
}

function TakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/quiz/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setQuiz(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      Questionid: questionId,
      Selectedoptionid: optionId
    });
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      Questionid: questionId,
      Answertext: text
    });
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;


    const unansweredQuestions = quiz.questions.filter(
      q => !answers.has(q.Questionid)
    );

    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/quiz/submit`,
        {
          Quizid: parseInt(quizId!),
          answers: Array.from(answers.values())
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers.get(question.Questionid);

    return (
      <Card key={question.Questionid} className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Question {index + 1}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({question.Questionpoints} {question.Questionpoints === 1 ? 'point' : 'points'})
              </span>
            </CardTitle>
            <Badge variant="outline">{question.Questiontype.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground whitespace-pre-wrap">{question.Questiontext}</p>

          {(question.Questiontype === 'multiple_choice' || question.Questiontype === 'true_false') && (
            <RadioGroup
              value={answer?.Selectedoptionid?.toString()}
              onValueChange={(value) => handleOptionSelect(question.Questionid, parseInt(value))}
            >
              {question.options
                .sort((a, b) => a.Optionorder - b.Optionorder)
                .map((option) => (
                  <div key={option.Optionid} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.Optionid.toString()} id={`option-${option.Optionid}`} />
                    <Label htmlFor={`option-${option.Optionid}`} className="cursor-pointer">
                      {option.Optiontext}
                    </Label>
                  </div>
                ))}
            </RadioGroup>
          )}

          {(question.Questiontype === 'short_answer' || question.Questiontype === 'essay') && (
            <Textarea
              rows={question.Questiontype === 'essay' ? 8 : 3}
              placeholder="Enter your answer here..."
              value={answer?.Answertext || ''}
              onChange={(e) => handleTextAnswer(question.Questionid, e.target.value)}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Quiz... | Go-Canvas</title>
        </Helmet>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Sidebar />
          <main className="pt-16 md:pl-64 transition-all duration-200">
            <div className="container mx-auto p-6 md:p-8 max-w-4xl">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading quiz...</p>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (result) {
    return (
      <>
        <Helmet>
          <title>Quiz Results | Go-Canvas</title>
        </Helmet>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Sidebar />
          <main className="pt-16 md:pl-64 transition-all duration-200">
            <div className="container mx-auto p-6 md:p-8 max-w-4xl">
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    Quiz Submitted Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.Attemptgraded ? (
                    <>
                      <div className="flex items-center gap-4 text-3xl font-bold">
                        <Trophy className="h-12 w-12 text-yellow-500" />
                        Score: {result.Attemptscore} / {result.Attemptmaxscore}
                        <span className="text-lg text-muted-foreground">
                          ({Math.round(((result.Attemptscore || 0) / (result.Attemptmaxscore || 1)) * 100)}%)
                        </span>
                      </div>
                      {result.Attemptfeedback && (
                        <Alert>
                          <AlertDescription>
                            <strong>Feedback:</strong>
                            <p className="mt-1">{result.Attemptfeedback}</p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Your quiz has been submitted and is awaiting grading from your instructor.
                        {result.Attemptscore !== null && (
                          <p className="mt-2">
                            <strong>Preliminary Score:</strong> {result.Attemptscore} / {result.Attemptmaxscore}
                            <br />
                            <span className="text-sm text-muted-foreground">
                              Subjective questions will be graded manually
                            </span>
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Separator />

                  <div className="flex gap-4">
                    <Button onClick={() => navigate('/student/courses')}>
                      Back to Courses
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/quiz/attempt/${result.Attemptid}`)}>
                      View Detailed Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <Helmet>
          <title>Error | Go-Canvas</title>
        </Helmet>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Sidebar />
          <main className="pt-16 md:pl-64 transition-all duration-200">
            <div className="container mx-auto p-6 md:p-8 max-w-4xl">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || 'Quiz not found'}</AlertDescription>
              </Alert>
              <Button onClick={() => navigate(-1)} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  const progress = (answers.size / quiz.questions.length) * 100;

  return (
    <>
      <Helmet>
        <title>{quiz.quizname} | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <Sidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-4xl">
            {/* Quiz Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">{quiz.quizname}</h1>
                  <p className="text-muted-foreground">{quiz.quizdescription}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {answers.size} / {quiz.questions.length} answered
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Questions */}
            {quiz.questions
              .sort((a, b) => a.Questionorder - b.Questionorder)
              .map((question, index) => renderQuestion(question, index))}

            {/* Submit Button */}
            <Card className="sticky bottom-4 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      {answers.size === quiz.questions.length ? (
                        <span className="text-green-500">✓ All questions answered</span>
                      ) : (
                        <span className="text-yellow-500">
                          ⚠ {quiz.questions.length - answers.size} question(s) remaining
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started: {startTime.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || answers.size < quiz.questions.length}
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default TakeQuiz;
