import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, BookOpen, Trophy, MessageSquare } from 'lucide-react';

import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import SubmissionForm, { SubmissionData } from '../../components/SubmissionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MainContentWrapper } from '@/components/MainContentWrapper';
import { getCurrentSemesterCode } from '@/lib/semester';

interface AssignmentDetail {
  Assignmentid: number;
  Assignmentname: string;
  Assignmentdescription: string;
  Courseid: number;
  Coursename?: string;
}

function AssignmentDetail() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignmentDetails = useCallback(async () => {
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

      const assignmentData = response.data.find(
        (a: AssignmentDetail) => a.Assignmentid.toString() === assignmentId
      );

      if (assignmentData) {
        setAssignment(assignmentData);
      } else {
        setError('Assignment not found');
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  const fetchSubmission = useCallback(async () => {
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


      const assignmentSubmission = response.data.find(
        (sub: SubmissionData) => sub.Assignmentid.toString() === assignmentId
      );

      if (assignmentSubmission) {
        setSubmission(assignmentSubmission);
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
      fetchSubmission();
    }
  }, [assignmentId, fetchAssignmentDetails, fetchSubmission]);

  const handleSubmissionComplete = (newSubmission: SubmissionData) => {
    setSubmission(newSubmission);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Go-Canvas</title>
        </Helmet>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Sidebar />
          <MainContentWrapper className="pt-16 transition-all duration-200">
            <div className="container mx-auto p-6 md:p-8 max-w-7xl">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading assignment...</p>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </>
    );
  }

  if (error || !assignment) {
    return (
      <>
        <Helmet>
          <title>Error | Go-Canvas</title>
        </Helmet>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Sidebar />
          <MainContentWrapper className="pt-16 transition-all duration-200">
            <div className="container mx-auto p-6 md:p-8 max-w-7xl">
              <Alert variant="destructive">
                <AlertDescription>{error || 'Assignment not found'}</AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/student/assignments')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assignments
              </Button>
            </div>
          </MainContentWrapper>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{assignment.Assignmentname} | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <Sidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-5xl">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/student/assignments')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assignments
            </Button>

            {/* Assignment Details */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">{assignment.Assignmentname}</CardTitle>
                    </div>
                    {assignment.Coursename && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {assignment.Coursename}
                      </p>
                    )}
                  </div>
                  {submission?.Submissiongraded && (
                    <Badge className="bg-green-500 text-white">
                      <Trophy className="mr-1 h-3 w-3" />
                      Graded
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                    Description
                  </h3>
                  <p className="text-foreground whitespace-pre-wrap">
                    {assignment.Assignmentdescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Graded Submission Display */}
            {submission?.Submissiongraded && (
              <Card className="mb-6 border-green-500 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    Grade: {submission.Submissionscore}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.Submissionfeedback && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquare className="h-4 w-4" />
                        Faculty Feedback:
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {submission.Submissionfeedback}
                        </p>
                      </div>
                    </div>
                  )}
                  {submission.Gradeddate && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Graded on: {new Date(submission.Gradeddate).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submission Status */}
            {submission && !submission.Submissiongraded && (
              <Alert className="mb-6 border-blue-500">
                <AlertDescription>
                  <strong>Submitted:</strong> {new Date(submission.Submitteddate).toLocaleString()}
                  <p className="text-sm text-muted-foreground mt-1">
                    Your submission is awaiting grading. You can resubmit to update your work.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <Separator className="my-6" />

            {/* Submission Form */}
            <SubmissionForm
              assignmentId={assignment.Assignmentid}
              assignmentName={assignment.Assignmentname}
              existingSubmission={submission}
              onSubmissionComplete={handleSubmissionComplete}
            />
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default AssignmentDetail;
