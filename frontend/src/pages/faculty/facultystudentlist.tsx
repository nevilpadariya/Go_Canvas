import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import axios from "axios";

import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";
import StudentTable from "../../components/facultystudenttable";

function CourseStudentList() {
  const token = localStorage.getItem("token");
  const { courseid } = useParams();
  const [students, setStudents] = useState([]);

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
        setStudents(response.data);
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

  return (
    <>
      <Helmet>
        <title>Students | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <FacultySidebar />
        
        <main className="pt-16 md:pl-64 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground mt-1">Enrolled Students</p>
            </div>
            
            <StudentTable students={students} />
          </div>
        </main>
      </div>
    </>
  );
}

export default CourseStudentList;