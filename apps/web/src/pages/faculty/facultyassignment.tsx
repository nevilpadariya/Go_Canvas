import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
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

interface AssignmentData {
  Assignmentid: number;
  Assignmentname: string;
  Assignmentdescription: string;
  Duedate?: string | null;
  Points?: number | null;
  Submissiontype?: string | null;
  Latepolicy_percent_per_day?: number | null;
  Latepolicy_grace_minutes?: number | null;
}

function AddAssignment() {
  const { courseid: courseidParam } = useParams();
  const navigate = useNavigate();
  const courseId = courseidParam || localStorage.getItem("courseid") || "";

  const [showForm, setShowForm] = useState(false);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [duedate, setDuedate] = useState("");
  const [points, setPoints] = useState<number>(100);
  const [submissiontype, setSubmissiontype] = useState<string>("text_and_file");
  const [latePercentPerDay, setLatePercentPerDay] = useState<string>("");
  const [lateGraceMinutes, setLateGraceMinutes] = useState<string>("");
  const [savedAssignments, setSavedAssignments] = useState<AssignmentData[]>([]);
  const [error, setError] = useState("");
  const currentSemester = getCurrentSemesterCode();

  const fetchAssignments = async () => {
    if (!courseId || courseId === "undefined") {
      setError("Select a course from the dashboard first.");
      return;
    }
    try {
      const data = await getApi<AssignmentData[]>(
        `/faculty/view_assignment_by_courseid?courseid=${courseId}`
      );
      setSavedAssignments(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch assignments. Check backend and login.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      await postApi("faculty/add_assignment", {
        Courseid: Number(courseId),
        Assignmentname: assignmentName,
        Assignmentdescription: assignmentDescription,
        Semester: currentSemester,
        Duedate: duedate || null,
        Points: points,
        Submissiontype: submissiontype,
        Latepolicy_percent_per_day: latePercentPerDay ? Number(latePercentPerDay) : null,
        Latepolicy_grace_minutes: lateGraceMinutes ? Number(lateGraceMinutes) : null,
      });
      setAssignmentName("");
      setAssignmentDescription("");
      setDuedate("");
      setPoints(100);
      setSubmissiontype("text_and_file");
      setLatePercentPerDay("");
      setLateGraceMinutes("");
      setShowForm(false);
      await fetchAssignments();
      setError("");
      alert("Assignment added successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add assignment");
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
      <FacultyPageLayout>
        <div className="w-full max-w-4xl p-6 md:p-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duedate">Due Date (optional)</Label>
                        <Input
                          id="duedate"
                          type="datetime-local"
                          value={duedate}
                          onChange={(e) => setDuedate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          min={1}
                          value={points}
                          onChange={(e) => setPoints(Number(e.target.value) || 100)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="submissiontype">Submission Type</Label>
                      <select
                        id="submissiontype"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={submissiontype}
                        onChange={(e) => setSubmissiontype(e.target.value)}
                      >
                        <option value="text">Text only</option>
                        <option value="file">File only</option>
                        <option value="text_and_file">Text and/or File</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latePercent">Late policy: % per day (optional)</Label>
                        <Input
                          id="latePercent"
                          type="number"
                          min={0}
                          placeholder="e.g. 5"
                          value={latePercentPerDay}
                          onChange={(e) => setLatePercentPerDay(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lateGrace">Grace period (minutes, optional)</Label>
                        <Input
                          id="lateGrace"
                          type="number"
                          min={0}
                          placeholder="e.g. 15"
                          value={lateGraceMinutes}
                          onChange={(e) => setLateGraceMinutes(e.target.value)}
                        />
                      </div>
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
                  <AccordionItem key={assignment.Assignmentid ?? index} value={`assignment-item-${index}`}>
                    <AccordionTrigger className="px-4">
                      {assignment.Assignmentname} {assignment.Points != null ? `(${assignment.Points} pts)` : ""}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2 space-y-2">
                        <div>
                          <Label className="text-base font-semibold">Description:</Label>
                          <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                            {assignment.Assignmentdescription}
                          </p>
                        </div>
                        {assignment.Duedate && (
                          <p className="text-sm text-muted-foreground">Due: {new Date(assignment.Duedate).toLocaleString()}</p>
                        )}
                        {assignment.Submissiontype && (
                          <p className="text-sm text-muted-foreground">Submission: {assignment.Submissiontype}</p>
                        )}
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/faculty_speedgrader/${courseId}?assignment=${assignment.Assignmentid}`)}
                          >
                            Open in SpeedGrader
                          </Button>
                        </div>
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

export default AddAssignment;
