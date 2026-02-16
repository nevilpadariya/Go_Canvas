import { FormEvent, useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useParams } from "react-router-dom";
import { FileText, MessageSquare, RefreshCw, Save, Send, Users } from "lucide-react";

import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi, postApi, putApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignmentData {
  Assignmentid: number;
  Assignmentname: string;
}

interface FileInfo {
  Fileurl: string;
  Fileoriginalname: string;
}

interface Submission {
  Submissionid: number;
  Assignmentid: number;
  Studentid: number;
  Studentname?: string;
  Submissioncontent?: string | null;
  Submissiongraded: boolean;
  Submissionscore?: string | null;
  Submissionfeedback?: string | null;
  Submitteddate: string;
  Gradeddate?: string | null;
  Fileinfo?: FileInfo | null;
}

interface SubmissionListResponse {
  Assignmentid: number;
  Assignmentname: string;
  Totalsubmissions: number;
  Gradedcount: number;
  Submissions: Submission[];
}

interface GradingStatsResponse {
  Totalstudents: number;
  Submittedcount: number;
  Gradedcount: number;
  Pendingcount: number;
  Averagescore?: number | null;
}

interface SubmissionComment {
  Commentid: number;
  Commentcontent: string;
  Authorname?: string;
  Createdat?: string;
}

function FacultySpeedGrader() {
  const { courseid: courseIdParam } = useParams();
  const location = useLocation();
  const initialAssignmentFromQuery = Number(new URLSearchParams(location.search).get("assignment"));
  const courseId = courseIdParam || localStorage.getItem("courseid") || "";

  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  const [submissionList, setSubmissionList] = useState<SubmissionListResponse | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [comments, setComments] = useState<SubmissionComment[]>([]);
  const [stats, setStats] = useState<GradingStatsResponse | null>(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [newComment, setNewComment] = useState("");

  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingSubmissionDetail, setLoadingSubmissionDetail] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState("");

  const loadAssignments = useCallback(async () => {
    if (!courseId || courseId === "undefined") {
      setError("Select a course from faculty dashboard first.");
      setLoadingAssignments(false);
      return;
    }

    setLoadingAssignments(true);
    setError("");

    try {
      const data = await getApi<AssignmentData[]>(`/faculty/view_assignment_by_courseid?courseid=${courseId}`);
      setAssignments(data);

      if (data.length > 0) {
        const hasQueryAssignment = data.some((a) => a.Assignmentid === initialAssignmentFromQuery);
        if (hasQueryAssignment) {
          setSelectedAssignmentId(initialAssignmentFromQuery);
        } else {
          setSelectedAssignmentId((prev) => prev ?? data[0].Assignmentid);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [courseId, initialAssignmentFromQuery]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const loadSubmissionsForAssignment = async (assignmentId: number) => {
    setLoadingSubmissions(true);
    setError("");

    try {
      const [list, gradingStats] = await Promise.all([
        getApi<SubmissionListResponse>(`/speedgrader/assignment/${assignmentId}`),
        getApi<GradingStatsResponse>(`/speedgrader/assignment/${assignmentId}/stats`),
      ]);

      setSubmissionList(list);
      setStats(gradingStats);

      const firstSubmissionId = list.Submissions?.[0]?.Submissionid ?? null;
      setSelectedSubmissionId(firstSubmissionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions");
      setSubmissionList(null);
      setStats(null);
      setSelectedSubmissionId(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (selectedAssignmentId) {
      loadSubmissionsForAssignment(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  const loadSubmissionDetail = async (submissionId: number) => {
    setLoadingSubmissionDetail(true);
    setError("");

    try {
      const [submission, submissionComments] = await Promise.all([
        getApi<Submission>(`/speedgrader/submission/${submissionId}`),
        getApi<SubmissionComment[]>(`/speedgrader/submission/${submissionId}/comments`),
      ]);

      setSelectedSubmission(submission);
      setComments(submissionComments);
      setScore(submission.Submissionscore || "");
      setFeedback(submission.Submissionfeedback || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load selected submission");
      setSelectedSubmission(null);
      setComments([]);
    } finally {
      setLoadingSubmissionDetail(false);
    }
  };

  useEffect(() => {
    if (selectedSubmissionId) {
      loadSubmissionDetail(selectedSubmissionId);
    } else {
      setSelectedSubmission(null);
      setComments([]);
    }
  }, [selectedSubmissionId]);

  const handleGradeSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSubmissionId || !score.trim()) return;

    setSavingGrade(true);
    setError("");

    try {
      await putApi(`/speedgrader/submission/${selectedSubmissionId}/grade`, {
        Submissionscore: score.trim(),
        Submissionfeedback: feedback.trim() || null,
      });

      await loadSubmissionDetail(selectedSubmissionId);
      if (selectedAssignmentId) {
        await loadSubmissionsForAssignment(selectedAssignmentId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save grade");
    } finally {
      setSavingGrade(false);
    }
  };

  const handleCommentSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSubmissionId || !newComment.trim()) return;

    setSavingComment(true);
    setError("");

    try {
      await postApi(`/speedgrader/submission/${selectedSubmissionId}/comments`, {
        Commentcontent: newComment.trim(),
      });

      setNewComment("");
      await loadSubmissionDetail(selectedSubmissionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add comment");
    } finally {
      setSavingComment(false);
    }
  };

  const openFile = (file?: FileInfo | null) => {
    if (!file?.Fileurl) return;

    const baseUrl = import.meta.env.VITE_API_URL;
    const fullUrl = file.Fileurl.startsWith("http") ? file.Fileurl : `${baseUrl}${file.Fileurl}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Helmet>
        <title>SpeedGrader | Go-Canvas</title>
      </Helmet>

      <FacultyPageLayout>
        <div className="w-full max-w-7xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SpeedGrader</h1>
              <p className="text-muted-foreground mt-1">Grade submissions and leave targeted feedback</p>
            </div>

            <Button variant="outline" onClick={loadAssignments} disabled={loadingAssignments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAssignments ? (
                <p className="text-sm text-muted-foreground">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assignments found for this course.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {assignments.map((assignment) => (
                    <Button
                      key={assignment.Assignmentid}
                      size="sm"
                      variant={selectedAssignmentId === assignment.Assignmentid ? "default" : "outline"}
                      onClick={() => setSelectedAssignmentId(assignment.Assignmentid)}
                    >
                      {assignment.Assignmentname}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.Totalstudents}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold">{stats.Submittedcount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Graded</p>
                  <p className="text-2xl font-bold">{stats.Gradedcount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.Pendingcount}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingSubmissions ? (
                  <p className="text-sm text-muted-foreground">Loading submissions...</p>
                ) : !submissionList || submissionList.Submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                ) : (
                  submissionList.Submissions.map((submission) => (
                    <button
                      key={submission.Submissionid}
                      type="button"
                      onClick={() => setSelectedSubmissionId(submission.Submissionid)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedSubmissionId === submission.Submissionid
                          ? "bg-accent border-primary/40"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      <p className="font-medium">{submission.Studentname || `Student ${submission.Studentid}`}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(submission.Submitteddate).toLocaleString()}
                      </p>
                      <div className="mt-2">
                        {submission.Submissiongraded ? (
                          <Badge className="bg-green-600">Graded ({submission.Submissionscore || "-"})</Badge>
                        ) : (
                          <Badge variant="outline">Needs grading</Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Submission Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedSubmissionId ? (
                  <p className="text-sm text-muted-foreground">Select a submission to grade.</p>
                ) : loadingSubmissionDetail ? (
                  <p className="text-sm text-muted-foreground">Loading submission detail...</p>
                ) : !selectedSubmission ? (
                  <p className="text-sm text-muted-foreground">Could not load selected submission.</p>
                ) : (
                  <>
                    <div className="rounded-md border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {selectedSubmission.Studentname || `Student ${selectedSubmission.Studentid}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(selectedSubmission.Submitteddate).toLocaleString()}
                          </p>
                        </div>
                        {selectedSubmission.Submissiongraded ? (
                          <Badge className="bg-green-600">Graded</Badge>
                        ) : (
                          <Badge variant="outline">Not graded</Badge>
                        )}
                      </div>

                      {selectedSubmission.Submissioncontent ? (
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Submission text</p>
                          <p className="text-sm whitespace-pre-wrap">{selectedSubmission.Submissioncontent}</p>
                        </div>
                      ) : null}

                      {selectedSubmission.Fileinfo ? (
                        <div className="flex items-center justify-between gap-2 rounded-md border p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4" />
                            <p className="text-sm truncate">{selectedSubmission.Fileinfo.Fileoriginalname}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openFile(selectedSubmission.Fileinfo)}>
                            Open File
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <form onSubmit={handleGradeSave} className="space-y-3 rounded-md border p-4">
                      <p className="font-medium">Grade Submission</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="score">Score</Label>
                          <Input
                            id="score"
                            value={score}
                            onChange={(event) => setScore(event.target.value)}
                            placeholder="e.g. 88"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                          id="feedback"
                          rows={4}
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          placeholder="Provide grading feedback..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={savingGrade || !score.trim()}>
                          <Save className="mr-2 h-4 w-4" />
                          {savingGrade ? "Saving..." : "Save Grade"}
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-3 rounded-md border p-4">
                      <p className="font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                      </p>

                      <div className="space-y-2 max-h-52 overflow-auto">
                        {comments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No comments yet.</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.Commentid} className="rounded-md border p-3">
                              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                                <span>{comment.Authorname || "Faculty"}</span>
                                {comment.Createdat ? <span>{new Date(comment.Createdat).toLocaleString()}</span> : null}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{comment.Commentcontent}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleCommentSave} className="space-y-2">
                        <Textarea
                          rows={3}
                          value={newComment}
                          onChange={(event) => setNewComment(event.target.value)}
                          placeholder="Add an inline/general comment..."
                        />
                        <div className="flex justify-end">
                          <Button type="submit" variant="outline" disabled={savingComment || !newComment.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            {savingComment ? "Posting..." : "Add Comment"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </FacultyPageLayout>
    </>
  );
}

export default FacultySpeedGrader;
