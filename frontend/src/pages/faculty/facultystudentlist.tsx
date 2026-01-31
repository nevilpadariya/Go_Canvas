import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi } from "@/lib/api";
import StudentTable from "../../components/facultystudenttable";

interface StudentRow {
  Coursename: string;
  Coursesemester: string;
  Studentcontactnumber: string;
  Studentemail: string;
  Studentid: string;
  Studentname: string;
  Coursegrade: string;
}

function CourseStudentList() {
  const { courseid: courseidParam } = useParams();
  const courseid = courseidParam || localStorage.getItem("courseid") || "";
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    if (!courseid || courseid === "undefined") {
      setError("Select a course from the dashboard first.");
      return;
    }
    try {
      const data = await getApi<StudentRow[]>(`/faculty/view_students?courseid=${courseid}`);
      setStudents(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch students. Check backend and login.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseid]);

  return (
    <>
      <Helmet>
        <title>Students | Go-Canvas</title>
      </Helmet>
      <FacultyPageLayout>
          <div className="w-full max-w-7xl p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground mt-1">Enrolled Students</p>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </div>
            
            <StudentTable students={students} />
          </div>
      </FacultyPageLayout>
    </>
  );
}

export default CourseStudentList;