import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi } from "@/lib/api";
import DashboardCardFaculty from "../../components/facultydashboardcard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const fetchCourses = async () => {
    try {
      const currentSemester = getCurrentSemester();
      const data = await getApi<Course[]>("/faculty/courses_taught");
      const currentSemNormalized = currentSemester.toUpperCase();
      const currentSemesterCourses = data.filter(
        (course) => (course.Coursesemester || "").toUpperCase() === currentSemNormalized
      );
      const previousSemesterCourses = data.filter(
        (course) => (course.Coursesemester || "").toUpperCase() !== currentSemNormalized
      );
      setCurrentSemesterData(currentSemesterCourses);
      setPreviousSemesterData(previousSemesterCourses);
    } catch {
      // leave state as-is on error
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
      <FacultyPageLayout>
          <div className="w-full max-w-7xl p-6 md:p-8">
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
                    buttondisabled={false}
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
      </FacultyPageLayout>
    </>
  );
}

export default FacultyDashboard;
