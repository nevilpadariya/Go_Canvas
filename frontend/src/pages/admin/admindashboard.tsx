import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import Header from "../../components/header";
import AdminSidebar from "../../components/adminsidebar";
import DashboardCardAdmin from "../../components/admindashboardcard";

interface Course {
  Coursename: string;
  Faculty: string;
  Coursesemester: string;
}

function AdminDashboardPage() {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/view_courses_by_faculty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          const coursesData = response.data.map((course: {
            Coursename: any;
            Facultyfirstname: any;
            Facultylastname: any;
            Coursesemester: any;
          }) => {
            const { Coursename, Facultyfirstname, Facultylastname, Coursesemester } = course;
            const facultyName = `${Facultyfirstname} ${Facultylastname}`;
            return {
              Coursename,
              Faculty: facultyName,
              Coursesemester
            };
          });

          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [token]);

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
        <AdminSidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of Courses and Faculty</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <div key={index}>
                  <DashboardCardAdmin 
                    coursename={course.Coursename}
                    coursesemester={course.Coursesemester}
                    facultyname={course.Faculty}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboardPage;
