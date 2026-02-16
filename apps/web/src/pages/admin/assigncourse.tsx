import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import Header from "../../components/header";
import AdminSidebar from "../../components/adminsidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
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
import { getSemesterOptions } from "@/lib/semester";

interface Faculty {
  Facultyid: number;
  Facultyname: string;
}

interface Course {
  Courseid: number;
  Coursename: string;
}

function AssignCourse() {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [semesterList] = useState<string[]>(() => getSemesterOptions(new Date(), { includeSummer: false }));
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  useEffect(() => {
    fetchFaculties();
    fetchCourses();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/view_faculties`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setFacultyList(response.data);
      } else {
        console.error("Error fetching faculties:", response.data);
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/view_courses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setCourseList(response.data);
      } else {
        console.error("Error fetching courses:", response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedCourse || !selectedFaculty || !selectedSemester) {
        window.alert("Please select Course, Faculty, and Semester");
        return;
    }

    try {

      const alreadyAssigned = await checkIfCourseAlreadyAssigned(parseInt(selectedCourse), parseInt(selectedFaculty), selectedSemester);
      
      if (alreadyAssigned) {
        window.alert("Course already assigned");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/assign_course`,
        {
          Courseid: parseInt(selectedCourse),
          Facultyid: parseInt(selectedFaculty),
          Coursesemester: selectedSemester,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {

        setSelectedFaculty("");
        setSelectedCourse("");
        setSelectedSemester("");
        window.alert("Course Successfully Assigned");
      } else {
        console.error("Error saving data:", response.data);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        window.alert("Course already assigned");
      } else {
        console.error("Error saving data:", error);
      }
    }
  };

  const checkIfCourseAlreadyAssigned = async (courseId: number, facultyId: number, semester: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/check_course_assignment?Courseid=${courseId}&Facultyid=${facultyId}&Coursesemester=${semester}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking course assignment:", error);
      return false;
    }
  };

  return (
    <>
      <Helmet>
        <title>Assign Course | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <AdminSidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Assign Course</h1>
              <p className="text-muted-foreground mt-1">Assign Courses to Faculty Members</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
                <CardDescription>Select the semester, course, and faculty member to create an assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="semester-select">Semester</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger id="semester-select">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Semesters</SelectLabel>
                          {semesterList.map((semester) => (
                            <SelectItem key={semester} value={semester}>
                              {semester}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course-select">Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger id="course-select">
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Courses</SelectLabel>
                          {courseList.map((course) => (
                            <SelectItem key={course.Courseid} value={course.Courseid.toString()}>
                              {course.Coursename}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty-select">Faculty</Label>
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger id="faculty-select">
                        <SelectValue placeholder="Select Faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Faculty Members</SelectLabel>
                          {facultyList.map((faculty) => (
                            <SelectItem key={faculty.Facultyid} value={faculty.Facultyid.toString()}>
                              {faculty.Facultyname}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} className="w-full md:w-auto">
                    Assign Course
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

export default AssignCourse;
