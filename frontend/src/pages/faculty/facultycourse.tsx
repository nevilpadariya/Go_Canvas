import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useParams } from "react-router-dom";

import Header from "../../components/header";
import FacultySidebar from "../../components/facultysidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import DashboardCardFaculty from "../../components/facultydashboardcard";

interface Course {
  Courseid: string;
  Coursename: string;
  Coursedescription: string;
  Coursesemester: string;
  Coursepublished: boolean;
}

function CourseFaculty() {
  const courseid = useParams().courseid;
  localStorage.setItem("courseid", courseid || "");

  const [currentSemesterData, setCurrentSemesterData] = useState<Course[]>([]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<Course[]>(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/courses_taught`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const currentSemesterCourses = response.data.filter(
          (course) => course.Coursesemester === "SPRING24"
        );
        setCurrentSemesterData(currentSemesterCourses);
      } else {
        throw new Error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <FacultySidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage Your Courses</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSemesterData.map((course, index) => (
                <div key={index}>
                  <DashboardCardFaculty
                    key={index}
                    courseid={course.Courseid}
                    coursename={course.Coursename}
                    coursedescription={course.Coursedescription}
                    coursesemester={course.Coursesemester}
                    buttondisabled={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default CourseFaculty;
