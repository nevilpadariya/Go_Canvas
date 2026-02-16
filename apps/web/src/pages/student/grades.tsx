import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Trophy, TrendingUp, BookOpen, FileText, Award } from 'lucide-react';

import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { getCurrentSemesterCode } from '@/lib/semester';

interface CourseGrade {
  Studentid: string;
  Courseid: string;
  Coursename: string;
  EnrollmentGrades: string;
  EnrollmentSemester: string;
}

interface Assignment {
  Assignmentid: number;
  Assignmentname: string;
  Courseid: number;
  Coursename: string;
}

interface Submission {
  Submissionid: number;
  Assignmentid: number;
  Submissionscore: string | null;
  Submissiongraded: boolean;
}

function StudentGrades() {
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllGradeData();
  }, []);

  const fetchAllGradeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentSemester = getCurrentSemesterCode();
      const headers = { Authorization: `Bearer ${token}` };


      const gradesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_grades`,
        { headers }
      );
      setCourseGrades(gradesResponse.data);


      const assignmentsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_assignment_published`,
        { headers, params: { current_semester: currentSemester } }
      );
      setAssignments(assignmentsResponse.data);


      const payload = JSON.parse(atob(token!.split('.')[1]));
      const studentId = payload.userid;

      const submissionsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/submissions/student/${studentId}`,
        { headers }
      );
      setSubmissions(submissionsResponse.data);

    } catch (error) {
      console.error('Error fetching grade data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId: number) => {
    return submissions.find(s => s.Assignmentid === assignmentId);
  };

  const calculateCourseStats = (courseid: string) => {
    const courseAssignments = assignments.filter(a => a.Courseid.toString() === courseid);
    const totalAssignments = courseAssignments.length;
    const gradedAssignments = courseAssignments.filter(a => {
      const sub = getSubmissionForAssignment(a.Assignmentid);
      return sub?.Submissiongraded;
    }).length;

    return {
      totalAssignments,
      gradedAssignments,
      completionRate: totalAssignments > 0 ? (gradedAssignments / totalAssignments) * 100 : 0
    };
  };

  const getLetterGrade = (grade: string) => {
    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue)) return grade;
    
    if (gradeValue >= 90) return 'A';
    if (gradeValue >= 80) return 'B';
    if (gradeValue >= 70) return 'C';
    if (gradeValue >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    const letter = getLetterGrade(grade);
    if (letter === 'A') return 'text-green-500';
    if (letter === 'B') return 'text-blue-500';
    if (letter === 'C') return 'text-yellow-500';
    if (letter === 'D') return 'text-orange-500';
    return 'text-red-500';
  };

  const semesters = Array.from(new Set(courseGrades.map(g => g.EnrollmentSemester)));
  
  const filteredGrades = selectedSemester === 'all'
    ? courseGrades
    : courseGrades.filter(g => g.EnrollmentSemester === selectedSemester);


  const calculateGPA = () => {
    const numericGrades = filteredGrades
      .map(g => parseFloat(g.EnrollmentGrades))
      .filter(g => !isNaN(g));
    
    if (numericGrades.length === 0) return 0;
    
    const avg = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;

    if (avg >= 90) return 4.0;
    if (avg >= 80) return 3.0;
    if (avg >= 70) return 2.0;
    if (avg >= 60) return 1.0;
    return 0;
  };

  return (
    <>
      <Helmet>
        <title>My Grades | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <Sidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
              </div>
              <p className="text-muted-foreground">Track your academic performance</p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateGPA().toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">4.0 Scale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredGrades.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {submissions.filter(s => s.Submissiongraded).length}/{assignments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Graded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredGrades.length > 0
                      ? Math.round(
                          filteredGrades
                            .map(g => parseFloat(g.EnrollmentGrades))
                            .filter(g => !isNaN(g))
                            .reduce((sum, grade) => sum + grade, 0) / filteredGrades.length
                        )
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">All Courses</p>
                </CardContent>
              </Card>
            </div>


            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Grades</h2>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map(semester => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading grades...</p>
                </CardContent>
              </Card>
            ) : filteredGrades.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">No Grades Yet</h3>
                  <p className="text-muted-foreground">
                    Your grades will appear here once your courses are graded
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredGrades.map((grade) => {
                  const stats = calculateCourseStats(grade.Courseid);
                  const courseAssignments = assignments.filter(
                    a => a.Courseid.toString() === grade.Courseid
                  );

                  return (
                    <Card key={grade.Courseid}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{grade.Coursename}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {grade.EnrollmentSemester}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${getGradeColor(grade.EnrollmentGrades)}`}>
                              {getLetterGrade(grade.EnrollmentGrades)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {grade.EnrollmentGrades}%
                            </div>
                          </div>
                        </div>


                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Assignments Graded</span>
                            <span className="font-medium">
                              {stats.gradedAssignments}/{stats.totalAssignments}
                            </span>
                          </div>
                          <Progress value={stats.completionRate} className="h-2" />
                        </div>
                      </CardHeader>

                      {courseAssignments.length > 0 && (
                        <CardContent>
                          <h4 className="font-semibold mb-3 text-sm">Assignment Breakdown</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {courseAssignments.slice(0, 5).map((assignment) => {
                                const submission = getSubmissionForAssignment(assignment.Assignmentid);
                                
                                return (
                                  <TableRow key={assignment.Assignmentid}>
                                    <TableCell className="font-medium">
                                      {assignment.Assignmentname}
                                    </TableCell>
                                    <TableCell>
                                      {submission ? (
                                        submission.Submissiongraded ? (
                                          <Badge className="bg-green-500">Graded</Badge>
                                        ) : (
                                          <Badge className="bg-blue-500">Submitted</Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline">Not Submitted</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {submission?.Submissiongraded
                                        ? submission.Submissionscore || '-'
                                        : '-'}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          {courseAssignments.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Showing 5 of {courseAssignments.length} assignments
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default StudentGrades;
