import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BookX } from "lucide-react";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DashboardCard from "../../components/dashboardcardstudent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const getCurrentSemester = () => {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear().toString().slice(-2);
  
  if (month <= 4) return `Spring${year}`;
  if (month <= 6) return `Summer${year}`;
  return `Fall${year}`;
};

import { MainContentWrapper } from "@/components/MainContentWrapper";

function DashboardPage() {
  const [previousSemesterData, setPreviousSemesterData] = useState([]);
  const [currentSemesterData, setCurrentSemesterData] = useState([]);
  let { courseid } = useParams();

  const currentSemester = getCurrentSemester();

  const fetchSemesterData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const demoCurrent = [
          { Courseid: 101, Coursename: "Intro to Go-Canvas", Coursedescription: "Explore features", Coursesemester: "DEMO" },
          { Courseid: 102, Coursename: "Student Portal", Coursedescription: "Grades, Assignments", Coursesemester: "DEMO" },
          { Courseid: 103, Coursename: "Faculty Tools", Coursedescription: "Quizzes, Announcements", Coursesemester: "DEMO" },
        ] as any;
        setCurrentSemesterData(demoCurrent);
        
        const demoPrevious = [
            { Courseid: 201, Coursename: "Archived Demo Course", Coursedescription: "Past features", Coursesemester: "DEMO-ARCHIVE" },
        ] as any;
        setPreviousSemesterData(demoPrevious);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/student/view_contents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const allCourses = response.data;
        

        const currentSemNormalized = currentSemester.toUpperCase();
        
        const current = allCourses.filter((c: any) => 
            (c.Coursesemester || c.EnrollmentSemester || "").toUpperCase() === currentSemNormalized
        );
        
        const previous = allCourses.filter((c: any) => 
            (c.Coursesemester || c.EnrollmentSemester || "").toUpperCase() !== currentSemNormalized
        );

        setCurrentSemesterData(current);
        setPreviousSemesterData(previous);
      } else {
        throw new Error("Failed to fetch course data");
      }
    } catch (error) {
      console.error("Error fetching semester data:", error);
    }
  };

  useEffect(() => {
    fetchSemesterData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <Sidebar />
        
        <MainContentWrapper className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome to Go-Canvas</p>
            </div>
            
            <div className="mb-8">
              {currentSemesterData.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 border-dashed">
                  <CardContent className="flex flex-col items-center gap-4 pt-6">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                      <BookX className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">No Courses Assigned Yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        You have not been assigned any courses yet. Please contact your department to register for courses.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSemesterData.map((course, index) => (
                    <div key={index}>
                      <DashboardCard
                        courseid={course["Courseid"]}
                        coursename={course["Coursename"]}
                        coursedescription={course["Coursedescription"]}
                        coursesemester={course["Coursesemester"]}
                        buttondisabled={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <Accordion type="single" collapsible className="w-full bg-card rounded-lg border">
                <AccordionItem value="previous-semesters" className="border-b-0">
                  <AccordionTrigger className="px-4">Previous Semesters</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                      {previousSemesterData.map((course, index) => (
                        <div key={index}>
                          <DashboardCard
                            courseid={course["Courseid"]}
                            coursename={course["Coursename"]}
                            coursedescription={course["Coursedescription"]}
                            coursesemester={course["EnrollmentSemester"]}
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

export default DashboardPage;
