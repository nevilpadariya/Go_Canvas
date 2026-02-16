import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi, postApi } from "@/lib/api";
import { getCurrentSemesterCode } from "@/lib/semester";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuizData {
  id: number;
  Quizname: string;
  Quizdescription: string;
  Semester: string;
}

function AddQuiz() {
  const { courseid: courseidParam } = useParams();
  const courseId = courseidParam || localStorage.getItem("courseid") || "";
  const [showForm, setShowForm] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [savedQuizzes, setSavedQuizzes] = useState<QuizData[]>([]);
  const [error, setError] = useState("");
  const currentSemester = getCurrentSemesterCode();

  useEffect(() => {
    if (!courseId || courseId === "undefined") {
      setError("Select a course from the dashboard first.");
      return;
    }
    const fetchQuizzes = async () => {
      try {
        const data = await getApi<QuizData[]>(`/faculty/view_quiz_by_courseid?courseid=${courseId}`);
        setSavedQuizzes(data);
        setError("");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to fetch quizzes. Check backend and login.";
        setError(msg);
      }
    };
    fetchQuizzes();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      const newQuiz = await postApi<QuizData>("/faculty/add_quiz", {
        Courseid: courseId,
        Quizname: quizName,
        Quizdescription: quizDescription,
        Semester: currentSemester,
      });
      setSavedQuizzes((prev) => [...prev, newQuiz]);
      setQuizName("");
      setQuizDescription("");
      setShowForm(false);
      setError("");
      alert("Quiz added successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add quiz");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizName.trim() || !quizDescription.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    handleSubmit();
  };

  return (
    <>
      <Helmet>
        <title>Quizzes | Go-Canvas</title>
      </Helmet>
      <FacultyPageLayout>
          <div className="w-full max-w-4xl p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
              <p className="text-muted-foreground mt-1">Manage Course Quizzes</p>
            </div>

            <div className="flex justify-end mb-6">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Add Quiz
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Add New Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <p className="text-destructive text-sm mb-4 font-medium">{error}</p>}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quizName">Quiz Name</Label>
                      <Input
                        id="quizName"
                        placeholder="Enter Quiz Name"
                        value={quizName}
                        onChange={(e) => setQuizName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quizDescription">Quiz Description</Label>
                      <Textarea
                        id="quizDescription"
                        placeholder="Enter Quiz Description"
                        rows={4}
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4">
                      <Button type="submit">Submit</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible className="w-full bg-card rounded-lg border" defaultValue="quiz-item-0">
              {savedQuizzes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No quizzes available. Click "Add Quiz" to create one.
                </div>
              ) : (
                savedQuizzes.map((quiz, index) => (
                  <AccordionItem key={index} value={`quiz-item-${index}`}>
                    <AccordionTrigger className="px-4">
                      Quiz {index + 1}: {quiz.Quizname}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2">
                        <Label className="text-base font-semibold">Description:</Label>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {quiz.Quizdescription}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </div>
      </FacultyPageLayout>
    </>
  );
}

export default AddQuiz;
