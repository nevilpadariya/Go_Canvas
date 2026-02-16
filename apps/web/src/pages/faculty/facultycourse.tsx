import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi } from "@/lib/api";
import { getCurrentSemesterCode } from "@/lib/semester";
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
      const data = await getApi<Course[]>("/faculty/courses_taught");
      const currentSemester = getCurrentSemesterCode();
      const currentSemesterCourses = data.filter(
        (course) => course.Coursesemester.toUpperCase() === currentSemester
      );
      setCurrentSemesterData(currentSemesterCourses);
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
      </FacultyPageLayout>
    </>
  );
}

export default CourseFaculty;
