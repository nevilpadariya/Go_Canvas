import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import AdminSidebar from "../../components/adminsidebar";
import Header from "../../components/header";
import StudentTable from "../../components/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function StudentList() {
  const token = localStorage.getItem("token");
  const [studentsGrouped, setStudentsGrouped] = useState<{ [key: string]: any[] }>({});

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/view_student_information`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const students = response.data;

        const groupedStudents = students.reduce((acc: { [x: string]: any[]; }, curr: {
          Coursename: string | number;
        }) => {
          if (!acc[curr.Coursename]) {
            acc[curr.Coursename] = [];
          }
          acc[curr.Coursename].push(curr);
          return acc;
        }, {});

        setStudentsGrouped(groupedStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <>
      <Helmet>
        <title>Students List | Go-Canvas</title>
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
              <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
              <p className="text-muted-foreground mt-1">View Student Information Grouped by Course</p>
            </div>
            
            {Object.keys(studentsGrouped).length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No student information available.
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                  {Object.entries(studentsGrouped).map(([courseName, students], index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card px-2">
                      <AccordionTrigger className="px-2 hover:no-underline">
                        <span className="font-semibold text-lg">{courseName}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-4">
                         <div className="pt-2">
                             <StudentTable students={students} />
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default StudentList;
