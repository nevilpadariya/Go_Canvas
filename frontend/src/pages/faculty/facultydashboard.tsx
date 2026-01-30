import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useParams } from "react-router-dom";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DashboardCardFaculty from "../../components/facultydashboardcard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MainContentWrapper } from "@/components/MainContentWrapper";

interface Course {
  Courseid: string;
  Coursename: string;
  Coursedescription: string;
  Coursesemester: string;
  Coursepublished: boolean; 
}

const getCurrentSemester = () => {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear().toString().slice(-2);
  
  if (month <= 4) return `Spring${year}`;
  if (month <= 6) return `Summer${year}`;
  return `Fall${year}`;
};

function FacultyDashboard() {
  const [previousSemesterData, setPreviousSemesterData] = useState<Course[]>([]);
  const [currentSemesterData, setCurrentSemesterData] = useState<Course[]>([]);
  const { courseid } = useParams();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentSemester = getCurrentSemester();
      
      const response = await axios.get<Course[]>(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/faculty/courses_taught`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {

        const currentSemNormalized = currentSemester.toUpperCase();
        
        const currentSemesterCourses = response.data.filter(
          (course) => (course.Coursesemester || "").toUpperCase() === currentSemNormalized
        );
        const previousSemesterCourses = response.data.filter(
          (course) => (course.Coursesemester || "").toUpperCase() !== currentSemNormalized
        );

        setCurrentSemesterData(currentSemesterCourses);
        setPreviousSemesterData(previousSemesterCourses);
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
        <Sidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Faculty Portal</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentSemesterData.map((course, index) => (
                <div key={index}>
                  <DashboardCardFaculty
                    key={index}
                    courseid={course.Courseid}
                    coursename={course.Coursename}
                    coursedescription={course.Coursedescription}
                    coursesemester={course.Coursesemester}
                    buttondisabled={!course.Coursepublished}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Accordion type="single" collapsible className="w-full bg-card rounded-lg border">
                <AccordionItem value="previous-semesters" className="border-b-0">
                  <AccordionTrigger className="px-4">Previous Semesters & Unpublished Courses</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                      {previousSemesterData.map((course, index) => (
                        <div key={index}>
                          <DashboardCardFaculty
                            key={index}
                            courseid={course.Courseid}
                            coursename={course.Coursename}
                            coursedescription={course.Coursedescription}
                            coursesemester={course.Coursesemester}
                            buttondisabled={true}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default FacultyDashboard;
