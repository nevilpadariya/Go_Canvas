import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import axios from "axios";

import Header from "../../components/header";
import FacultySidebar from "../../components/facultysidebar";
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

interface Student {
  Studentid: number;
  Studentname: string;
}

function AssignGrades() {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const token = localStorage.getItem("token");
  const { courseid } = useParams();

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/view_students?courseid=${courseid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setStudentList(response.data);
      } else {
        console.error("Failed to fetch students:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token, courseid]);

  const handleSave = async () => {
    if (!selectedStudent || !selectedGrade) {
      alert("Please select both a student and a grade.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/assign_grades`,
        {
          Studentid: parseInt(selectedStudent),
          Courseid: courseid,
          Semester: "SPRING24",
          Grade: selectedGrade,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Data saved successfully:", response.data);
        setSelectedStudent("");
        setSelectedGrade("");
        window.alert("Grade Successfully Assigned");
      } else {
        console.error("Error saving data:", response.data);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Assignments Grades | Go-Canvas</title>
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
              <h1 className="text-3xl font-bold tracking-tight">Assign Grades</h1>
              <p className="text-muted-foreground mt-1">Assignments Grade Management</p>
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
        </main>
      </div>
    </>
  );
}

export default AssignGrades;
