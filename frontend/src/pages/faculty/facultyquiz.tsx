import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";
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
  const { courseid } = useParams();
  const courseId = courseid || ""; 
  const [showForm, setShowForm] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [savedQuizzes, setSavedQuizzes] = useState<QuizData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/view_quiz_by_courseid?courseid=${courseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSavedQuizzes(data);
        } else {
          setError("Failed to fetch quizzes");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("Failed to fetch quizzes");
      }
    };

    fetchQuizzes();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/add_quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            Courseid: courseId,
            Quizname: quizName,
            Quizdescription: quizDescription,
            Semester: "SPRING24",
          }),
        }
      );
      if (response.ok) {
        const newQuiz = await response.json();
        setSavedQuizzes([...savedQuizzes, newQuiz]);
        setQuizName("");
        setQuizDescription("");
        setShowForm(false);
        setError("");
        alert("Quiz added successfully");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Failed to add quiz");
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
      setError("Failed to add quiz");
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
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <FacultySidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-4xl">
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
        </main>
      </div>
    </>
  );
}

export default AddQuiz;
