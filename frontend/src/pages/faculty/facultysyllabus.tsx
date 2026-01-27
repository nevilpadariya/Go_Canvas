import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

function AddSyllabus() {
  const { courseid } = useParams();
  const courseId = courseid || "";
  
  const [showForm, setShowForm] = useState(false);
  const [syllabusName, setSyllabusName] = useState("");
  const [syllabusDescription, setSyllabusDescription] = useState("");
  const [savedSyllabus, setSavedSyllabus] = useState<{ Courseid: number, Coursesemester: string, Coursedescription: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/view_content_by_courseid?courseid=${courseId}`,
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
          setSavedSyllabus(data);
        } else {
          console.error("Failed to fetch syllabus");
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      }
    };

    fetchSyllabus();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/update-syllabus/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            Courseid: courseId, 
            Coursesemester: "SPRING24",
            Coursedescription: syllabusDescription,
          }),
        }
      );
      if (response.ok) {
        const newSyllabus = await response.json();
        setSavedSyllabus([...savedSyllabus, newSyllabus]);
        setSyllabusName("");
        setSyllabusDescription("");
        setShowForm(false);
        setError("");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Failed to add syllabus");
      }
    } catch (error) {
      console.error("Error adding syllabus:", error);
      setError("Failed to add syllabus");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!syllabusName.trim() || !syllabusDescription.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    handleSubmit();
  };

  const handleCancel = () => {
    setSyllabusName("");
    setSyllabusDescription("");
    setShowForm(false);
    setError("");
  };

  return (
    <>
      <Helmet>
        <title>Syllabus | Go-Canvas</title>
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
              <h1 className="text-3xl font-bold tracking-tight">Syllabus</h1>
              <p className="text-muted-foreground mt-1">Manage Course Syllabus</p>
            </div>

            <div className="flex justify-end mb-6">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Update Syllabus
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Add New Syllabus Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <p className="text-destructive text-sm mb-4 font-medium">{error}</p>}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter Title"
                        value={syllabusName}
                        onChange={(e) => setSyllabusName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Content Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter Content Description"
                        rows={4}
                        value={syllabusDescription}
                        onChange={(e) => setSyllabusDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4">
                      <Button type="submit">Submit</Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible className="w-full bg-card rounded-lg border" defaultValue="syllabus-item-0">
              {savedSyllabus.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No syllabus available. Click "Update Syllabus" to add one.
                </div>
              ) : (
                savedSyllabus.map((syllabus, index) => (
                  <AccordionItem key={index} value={`syllabus-item-${index}`}>
                    <AccordionTrigger className="px-4">
                      Syllabus {index + 1}: {syllabus.Coursesemester}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2">
                        <Label className="text-base font-semibold">Description:</Label>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {syllabus.Coursedescription}
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

export default AddSyllabus;
