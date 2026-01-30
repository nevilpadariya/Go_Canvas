import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import AdminSidebar from "../../components/adminsidebar";
import Header from "../../components/header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";

interface StudentCourseDetail {
  Studentid: number;
  Studentfirstname: string;
  Studentlastname: string;
  Studentcontactnumber: string;
  Courseid: number;
  Coursename: string;
  Coursesemester: string;
  EnrollmentGrades: string | null;
  Status: string;
}

interface User {
  Userid: number;
  Useremail: string;
  Userrole: string;
  Userfirstname: string;
  Userlastname: string;
}

interface Course {
  Courseid?: number;
  Coursename: string;
  Faculty: string;
  Coursesemester: string;
}

// Helper to determine current semester
const getCurrentSemester = () => {
  const date = new Date();
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear().toString().slice(-2);
  
  if (month <= 4) return `Spring${year}`;      // Jan-May
  if (month <= 6) return `Summer${year}`;      // Jun-Jul
  return `Fall${year}`;                        // Aug-Dec
};

function StudentList() {
  const token = localStorage.getItem("token");
  const [studentDetails, setStudentDetails] = useState<StudentCourseDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Assignment Form State
  const [assignStudentId, setAssignStudentId] = useState<string>("");
  const [assignCourseId, setAssignCourseId] = useState<string>("");
  const [assignSemester, setAssignSemester] = useState<string>(getCurrentSemester());

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/students_details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          setStudentDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchCourses = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/view_courses`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200) {
            // Mapping from CoursesForAdmin model which only has Courseid, Coursename
            const coursesData = response.data.map((course: {
              Courseid: number;
              Coursename: string;
            }) => {
              return {
                 Courseid: course.Courseid,
                 Coursename: course.Coursename,
                 // Faculty and Coursesemester are not available in view_courses
                 Faculty: "", 
                 Coursesemester: ""
              };
            });
  
            setCourses(coursesData);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
    };

    if (token) {
        fetchStudentDetails();
        fetchUsers();
        fetchCourses();
    }
  }, [token]);

  const handleAssignCourse = async () => {
    if (!assignStudentId || !assignCourseId || !assignSemester) {
        alert("Please select student, course and semester");
        return;
    }
    
    try {
        await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/assign_course_student`,
            {
                student_id: parseInt(assignStudentId),
                course_id: parseInt(assignCourseId),
                semester: assignSemester
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Course assigned successfully!");
        setAssignStudentId("");
        setAssignCourseId("");
        setAssignSemester("");
        
        // Refresh student details
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/students_details`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            setStudentDetails(response.data);
        }

    } catch (error) {
        console.error("Error assigning course:", error);
        alert("Failed to assign course. Student might already be enrolled.");
    }
  };


  const filteredDetails = assignStudentId
    ? studentDetails.filter(d => d.Studentid.toString() === assignStudentId)
    : studentDetails;

  return (
    <>
      <Helmet>
        <title>Student Management | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <AdminSidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
              <p className="text-muted-foreground mt-1">Assign courses and view enrollment status</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Assign Course to Student</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Student</label>
                                <Select value={assignStudentId} onValueChange={setAssignStudentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.filter(u => u.Userrole === 'Student').map(student => (
                                            <SelectItem key={student.Userid} value={student.Userid.toString()}>
                                                {student.Userfirstname} {student.Userlastname} ({student.Userid})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Course</label>
                                <Select value={assignCourseId} onValueChange={setAssignCourseId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.Courseid} value={course.Courseid?.toString() || ""}>
                                                {course.Coursename}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Input 
                                    placeholder="e.g. Fall 2024"
                                    value={assignSemester}
                                    onChange={(e) => setAssignSemester(e.target.value)}
                                />
                            </div>

                            <Button onClick={handleAssignCourse}>Assign Course</Button>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>
                            {assignStudentId ? "Selected Student History" : "Student Course History"}
                        </CardTitle>
                        {assignStudentId && (
                            <Button variant="ghost" size="sm" onClick={() => setAssignStudentId("")}>
                                Clear Filter
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDetails.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No records found for this student.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDetails.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="font-medium">{detail.Studentfirstname} {detail.Studentlastname}</div>
                                                <div className="text-xs text-muted-foreground">ID: {detail.Studentid}</div>
                                            </TableCell>
                                            <TableCell>{detail.Coursename}</TableCell>
                                            <TableCell>{detail.Coursesemester}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    className={
                                                        detail.Status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                        detail.Status === 'Failed' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                    }
                                                    variant="outline"
                                                >
                                                    {detail.Status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default StudentList;

