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

interface AssignmentData {
  id: number;
  Assignmentname: string;
  Assignmentdescription: string;
}

function AddAssignment() {
  const token = localStorage.getItem("token");
  const { courseid } = useParams();
  const courseId = courseid || "";

  const [showForm, setShowForm] = useState(false);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [savedAssignments, setSavedAssignments] = useState<AssignmentData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/view_assignment_by_courseid?courseid=${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSavedAssignments(data);
        } else {
          setError("Failed to fetch assignments");
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setError("Failed to fetch assignments");
      }
    };

    fetchAssignments();
  }, [courseId, token]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/add_assignment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Courseid: courseId,
            Assignmentname: assignmentName,
            Assignmentdescription: assignmentDescription,
            Semester: "SPRING24",
          }),
        }
      );
      if (response.ok) {
        const newAssignment = await response.json();
        setSavedAssignments([...savedAssignments, newAssignment]);
        setAssignmentName("");
        setAssignmentDescription("");
        setShowForm(false);
        setError("");
        alert("Assignment added successfully");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Failed to add assignment");
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      setError("Failed to add assignment");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentName.trim() || !assignmentDescription.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    handleSubmit();
  };

  return (
    <>
      <Helmet>
        <title>Assignments | Go-Canvas</title>
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
              <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
              <p className="text-muted-foreground mt-1">Manage Course Assignments</p>
            </div>

            <div className="flex justify-end mb-6">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Add Assignment
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Add New Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <p className="text-destructive text-sm mb-4 font-medium">{error}</p>}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignmentName">Assignment Name</Label>
                      <Input
                        id="assignmentName"
                        placeholder="Enter Assignment Name"
                        value={assignmentName}
                        onChange={(e) => setAssignmentName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="assignmentDescription">Assignment Description</Label>
                      <Textarea
                        id="assignmentDescription"
                        placeholder="Enter Assignment Description"
                        rows={4}
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
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

            <Accordion type="single" collapsible className="w-full bg-card rounded-lg border" defaultValue="assignment-item-0">
              {savedAssignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No assignments available. Click "Add Assignment" to create one.
                </div>
              ) : (
                savedAssignments.map((assignment, index) => (
                  <AccordionItem key={index} value={`assignment-item-${index}`}>
                    <AccordionTrigger className="px-4">
                      Assignment {index + 1}: {assignment.Assignmentname}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2">
                        <Label className="text-base font-semibold">Description:</Label>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {assignment.Assignmentdescription}
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

export default AddAssignment;
