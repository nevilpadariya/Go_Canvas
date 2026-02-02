import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi, postApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Student {
  Studentid: number;
  Studentname: string;
  Coursesemester: string;
}

function AssignGrades() {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { courseid: courseidParam } = useParams();
  const courseid = courseidParam || localStorage.getItem("courseid") || "";
  const isSessionExpired = error?.toLowerCase().includes("session expired") ?? false;

  const fetchStudents = async () => {
    if (!courseid || courseid === "undefined") {
      setError("Select a course from the dashboard first.");
      return;
    }
    try {
      const data = await getApi<Student[]>(`/faculty/view_students?courseid=${courseid}`);
      setStudentList(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch students. Check backend and login.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseid]);

  const handleSave = async () => {
    if (!selectedStudent || !selectedGrade) {
      setError("Please select both a student and a grade.");
      setSuccessMessage("");
      return;
    }
    const student = studentList.find((s) => s.Studentid.toString() === selectedStudent);
    const semester = student?.Coursesemester || "SPRING24";
    const courseIdNum = courseid ? parseInt(String(courseid), 10) : 0;
    if (!courseIdNum) {
      setError("Invalid course. Select a course from the dashboard first.");
      setSuccessMessage("");
      return;
    }
    setError("");
    setSuccessMessage("");
    try {
      await postApi("/faculty/assign_grades", {
        Studentid: parseInt(selectedStudent, 10),
        Courseid: courseIdNum,
        Semester: semester,
        Grade: selectedGrade,
      });
      setSelectedStudent("");
      setSelectedGrade("");
      setSuccessMessage("Grade assigned successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign grade.");
      setSuccessMessage("");
    }
  };

  return (
    <>
      <Helmet>
        <title>Assignments Grades | Go-Canvas</title>
      </Helmet>
      <FacultyPageLayout>
          <div className="w-full max-w-4xl p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Assign Grades</h1>
              <p className="text-muted-foreground mt-1">Assignments Grade Management</p>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                    {isSessionExpired && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("role");
                          navigate("/login");
                        }}
                      >
                        Log in again
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert variant="success" className="mt-4">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Grade Selection</CardTitle>
                <CardDescription>Select a student and assign a grade for the current course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="student-select">Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger id="student-select">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Students</SelectLabel>
                          {studentList.map((student) => (
                            <SelectItem key={student.Studentid} value={student.Studentid.toString()}>
                              {student.Studentname}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade-select">Grade</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger id="grade-select">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Grades</SelectLabel>
                          {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} className="w-full md:w-auto">
                    Save Grade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
      </FacultyPageLayout>
    </>
  );
}

export default AssignGrades;
