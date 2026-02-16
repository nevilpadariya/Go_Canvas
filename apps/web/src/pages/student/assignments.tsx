import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MainContentWrapper } from "@/components/MainContentWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentSemesterCode } from '@/lib/semester';

interface Assignment {
  Assignmentid: number;
  Assignmentname: string;
  Assignmentdescription: string;
  Courseid: number;
  Coursename: string;
}

interface Submission {
  Submissionid: number;
  Assignmentid: number;
  Submissiongraded: boolean;
  Submissionscore: string | null;
}

interface UniqueCourse {
  id: number;
  name: string;
}

function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentSemester = getCurrentSemesterCode();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/view_assignment_published`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { current_semester: currentSemester }
        }
      );
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      

      const payload = JSON.parse(atob(token.split('.')[1]));
      const studentId = payload.userid;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/submissions/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const getSubmissionStatus = (assignmentId: number) => {
    const submission = submissions.find(s => s.Assignmentid === assignmentId);
    if (!submission) return 'not_submitted';
    if (submission.Submissiongraded) return 'graded';
    return 'submitted';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Graded</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500"><Clock className="mr-1 h-3 w-3" /> Submitted</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" /> Not Submitted</Badge>;
    }
  };

  const uniqueCourses: UniqueCourse[] = Array.from(
    new Set(assignments.map(a => JSON.stringify({ id: a.Courseid, name: a.Coursename })))
  ).map((str) => JSON.parse(str) as UniqueCourse);

  const filteredAssignments = assignments.filter(assignment => {
    const courseMatch = filterCourse === 'all' || assignment.Courseid.toString() === filterCourse;
    const status = getSubmissionStatus(assignment.Assignmentid);
    const statusMatch = filterStatus === 'all' || status === filterStatus;
    return courseMatch && statusMatch;
  });

  return (
    <>
      <Helmet>
        <title>Assignments | Go-Canvas</title>
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
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
              </div>
              <p className="text-muted-foreground">View and submit your assignments</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="w-full sm:w-auto">
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_submitted">Not Submitted</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignments Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/50 border-dashed">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Assignments Found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {filterCourse !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You have no assignments at the moment'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAssignments.map((assignment) => {
                  const status = getSubmissionStatus(assignment.Assignmentid);
                  const submission = submissions.find(s => s.Assignmentid === assignment.Assignmentid);
                  
                  return (
                    <Card 
                      key={assignment.Assignmentid}
                      className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/50"
                      onClick={() => navigate(`/student/assignment/${assignment.Assignmentid}`)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{assignment.Assignmentname}</CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.Coursename}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(status)}
                            {submission?.Submissionscore && (
                              <Badge variant="secondary">{submission.Submissionscore}</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {assignment.Assignmentdescription}
                        </p>
                        <div className="mt-4">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            View Assignment
                          </Button>
                        </div>
                      </CardContent>
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

export default StudentAssignments;
