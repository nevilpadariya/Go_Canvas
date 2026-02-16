import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../components/sidebar";
import Header from "../../components/header";
import DashboardCard from "../../components/dashboardcardstudent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { getCurrentSemesterCode } from "@/lib/semester";

interface Assignment {
  Courseid: string;
  Coursename: string;
  Assignmentid: string;
  Assignmentname: string;
  Assignmentdescription: string;
}

interface Quiz {
  Courseid: string;
  Coursename: string;
  Quizid: string;
  Quizname: string;
  Quizdescription: string;
}

interface Announcement {
  Courseid: string;
  Coursename: string;
  Announcementid: string;
  Announcementname: string;
  Announcementdescription: string;
}

interface Grade {
  Studentid: string;
  Courseid: string;
  Coursename: string;
  EnrollmentGrades: string;
  EnrollmentSemester: string;
}

interface Content {
  Courseid: string;
  Coursename: string;
  Coursedescription: string;
  Coursesemester: string;
}

function Course() {
  const [courseid1, setCourseid1] = React.useState("");
  const [coursename, setCoursename] = React.useState("");
  const [coursedescription, setCoursedescription] = React.useState("");

  const { courseid } = useParams();
  const navigate = useNavigate();
  const currentSemester = getCurrentSemesterCode();

  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);

  useEffect(() => {
    if (courseid) {
      localStorage.setItem("courseid", courseid);
    }
  }, [courseid]);

  async function fetchContents() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_contents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const contents = response.data.filter(
          (content: Content) => content.Courseid == courseid
        );
        if (contents.length > 0) {
          setCourseid1(contents[0].Courseid);
          setCoursename(contents[0].Coursename);
          setCoursedescription(contents[0].Coursedescription);
        }
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  }

  async function fetchAssignments() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_assignment_published`,
        {
          params: {
            current_semester: currentSemester,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const assignments = response.data.filter(
          (assignment: Assignment) => assignment.Courseid == courseid
        );
        setAssignments(assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }

  async function fetchQuizzes() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_quizzes_published`,
        {
          params: {
            current_semester: currentSemester,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const quizzes = response.data.filter(
          (quiz: Quiz) => quiz.Courseid == courseid
        );
        setQuizzes(quizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }

  async function fetchAnnouncements() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_announcements_published`,
        {
          params: {
            current_semester: currentSemester,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const announcements = response.data.filter(
          (announcement: Announcement) => announcement.Courseid == courseid
        );
        setAnnouncements(announcements);
      }
    } catch (error) {
      console.error("Error fetching Announcements:", error);
    }
  }

  async function fetchGrades() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_grades`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const filteredGrades = response.data.filter(
          (grade: Grade) => grade.Courseid == courseid
        );
        setGrades(filteredGrades);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContents();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
    fetchQuizzes();
    fetchAnnouncements();
    fetchGrades();
  }, [courseid]);

  return (
    <>
      <Helmet>
        <title>{coursename ? `${coursename} | Go-Canvas` : "Course | Go-Canvas"}</title>
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
              <h1 className="text-3xl font-bold tracking-tight">Course Details</h1>
              <p className="text-muted-foreground mt-1">{coursename}</p>
            </div>

            <div className="space-y-8">
              <div className="max-w-md">
                <DashboardCard
                  courseid={courseid1}
                  coursename={coursename}
                  coursedescription={coursedescription}
                  coursesemester={currentSemester}
                  buttondisabled={true}
                />
              </div>

              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  

                  <AccordionItem value="announcements" className="border rounded-lg bg-card text-card-foreground">
                    <AccordionTrigger className="px-4 hover:no-underline">Announcements</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Announcement Name</TableHead>
                              <TableHead>Announcement Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {announcements.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                  No announcements
                                </TableCell>
                              </TableRow>
                            ) : (
                              announcements.map((announcement) => (
                                <TableRow key={announcement["Announcementid"]}>
                                  <TableCell className="font-medium">{announcement["Announcementname"]}</TableCell>
                                  <TableCell>{announcement["Announcementdescription"]}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>


                  <AccordionItem value="quizzes" className="border rounded-lg bg-card text-card-foreground">
                    <AccordionTrigger className="px-4 hover:no-underline">Quizzes</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Quiz Name</TableHead>
                              <TableHead>Quiz Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quizzes.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                  No quizzes
                                </TableCell>
                              </TableRow>
                            ) : (
                              quizzes.map((quiz) => (
                                <TableRow 
                                  key={quiz["Quizid"]}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => navigate(`/student/quiz/${quiz["Quizid"]}`)}
                                >
                                  <TableCell className="font-medium">{quiz["Quizname"]}</TableCell>
                                  <TableCell>{quiz["Quizdescription"]}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>


                  <AccordionItem value="assignments" className="border rounded-lg bg-card text-card-foreground">
                    <AccordionTrigger className="px-4 hover:no-underline">Assignments</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Assignment Name</TableHead>
                              <TableHead>Assignment Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                  No assignments
                                </TableCell>
                              </TableRow>
                            ) : (
                              assignments.map((assignment) => (
                                <TableRow 
                                  key={assignment["Assignmentid"]}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => navigate(`/student/assignment/${assignment["Assignmentid"]}`)}
                                >
                                  <TableCell className="font-medium">{assignment["Assignmentname"]}</TableCell>
                                  <TableCell>{assignment["Assignmentdescription"]}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Grades */}
                  <AccordionItem value="grades" className="border rounded-lg bg-card text-card-foreground">
                    <AccordionTrigger className="px-4 hover:no-underline">Grades</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Grades</TableHead>
                              <TableHead>Semester</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grades.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                  No grades available
                                </TableCell>
                              </TableRow>
                            ) : (
                              grades.map((grade, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{grade["Coursename"]}</TableCell>
                                  <TableCell>{grade["EnrollmentGrades"]}</TableCell>
                                  <TableCell>{grade["EnrollmentSemester"]}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default Course;
