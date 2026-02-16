import { FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Pin, Lock, Send, RefreshCw } from "lucide-react";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { getApi, postApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentCourse {
  Courseid: number;
  Coursename: string;
}

interface DiscussionSummary {
  Discussionid: number;
  Discussiontitle: string;
  Discussioncontent: string;
  Discussionpinned: boolean;
  Discussionlocked: boolean;
  Replycount: number;
  Authorname?: string | null;
  Createdat?: string | null;
  Points?: number | null;
}

interface DiscussionReply {
  Replyid: number;
  Replycontent: string;
  Authorname?: string | null;
  Authorrole: string;
  Createdat?: string | null;
  Replies: DiscussionReply[];
}

interface DiscussionDetail extends DiscussionSummary {
  Replies: DiscussionReply[];
}

interface DiscussionListResponse {
  Discussions: DiscussionSummary[];
}

function ReplyThread({ reply, depth = 0 }: { reply: DiscussionReply; depth?: number }) {
  return (
    <div className="space-y-2">
      <div className="rounded-md border p-3" style={{ marginLeft: `${depth * 16}px` }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{reply.Authorname || "Unknown"}</p>
          {reply.Createdat && (
            <p className="text-xs text-muted-foreground">{new Date(reply.Createdat).toLocaleString()}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{reply.Replycontent}</p>
      </div>

      {reply.Replies.map((child) => (
        <ReplyThread key={child.Replyid} reply={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function StudentDiscussions() {
  const { courseid: courseIdParam } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseIdParam || localStorage.getItem("courseid") || ""
  );

  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionDetail | null>(null);
  const [replyText, setReplyText] = useState("");

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseIdParam && courseIdParam !== selectedCourseId) {
      setSelectedCourseId(courseIdParam);
    }
  }, [courseIdParam, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.Courseid) === selectedCourseId),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getApi<StudentCourse[]>("/student/view_contents");
        setCourses(data);

        setSelectedCourseId((previous) => {
          if (!previous && data.length > 0) {
            const fallbackId = String(data[0].Courseid);
            localStorage.setItem("courseid", fallbackId);
            return fallbackId;
          }
          return previous;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load courses");
      }
    };

    loadCourses();
  }, []);

  const fetchDiscussions = async (courseId: string) => {
    if (!courseId) {
      setLoadingList(false);
      return;
    }

    setLoadingList(true);
    setError("");

    try {
      const data = await getApi<DiscussionListResponse>(`/discussions/course/${courseId}`);
      setDiscussions(data.Discussions || []);

      const firstId = data.Discussions?.[0]?.Discussionid ?? null;
      setSelectedDiscussionId((prev) => prev ?? firstId);
      localStorage.setItem("courseid", courseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load discussions");
      setDiscussions([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDiscussions(selectedCourseId);
  }, [selectedCourseId]);

  const fetchDiscussionDetail = async (discussionId: number) => {
    setLoadingDetail(true);
    try {
      const data = await getApi<DiscussionDetail>(`/discussions/${discussionId}`);
      setSelectedDiscussion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load discussion thread");
      setSelectedDiscussion(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedDiscussionId) {
      fetchDiscussionDetail(selectedDiscussionId);
    } else {
      setSelectedDiscussion(null);
    }
  }, [selectedDiscussionId]);

  const handleCourseSwitch = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedDiscussionId(null);
    setSelectedDiscussion(null);
    navigate(`/student/discussions/${courseId}`);
  };

  const handleReplySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDiscussion || !replyText.trim()) return;

    setSubmittingReply(true);
    setError("");

    try {
      await postApi(`/discussions/${selectedDiscussion.Discussionid}/replies`, {
        Replycontent: replyText.trim(),
      });
      setReplyText("");
      await fetchDiscussionDetail(selectedDiscussion.Discussionid);
      await fetchDiscussions(selectedCourseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Discussions | Go-Canvas</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>

        <Header />
        <Sidebar />

        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
                <p className="text-muted-foreground mt-1">
                  {selectedCourse?.Coursename || "Select a course to open discussion threads"}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => fetchDiscussions(selectedCourseId)}
                disabled={!selectedCourseId || loadingList}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {courses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => {
                  const courseId = String(course.Courseid);
                  const active = courseId === selectedCourseId;
                  return (
                    <Button
                      key={courseId}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => handleCourseSwitch(courseId)}
                    >
                      {course.Coursename}
                    </Button>
                  );
                })}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Threads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingList ? (
                    <p className="text-sm text-muted-foreground">Loading discussions...</p>
                  ) : discussions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No discussions for this course yet.</p>
                  ) : (
                    discussions.map((discussion) => (
                      <button
                        key={discussion.Discussionid}
                        type="button"
                        onClick={() => setSelectedDiscussionId(discussion.Discussionid)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedDiscussionId === discussion.Discussionid
                            ? "bg-accent border-primary/40"
                            : "hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium line-clamp-2">{discussion.Discussiontitle}</p>
                          <div className="flex items-center gap-1">
                            {discussion.Discussionpinned && <Pin className="h-4 w-4 text-primary" />}
                            {discussion.Discussionlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{discussion.Replycount} replies</span>
                          {discussion.Points ? <Badge variant="outline">{discussion.Points} pts</Badge> : null}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Thread Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedDiscussionId ? (
                    <p className="text-sm text-muted-foreground">Select a thread to read and reply.</p>
                  ) : loadingDetail ? (
                    <p className="text-sm text-muted-foreground">Loading thread...</p>
                  ) : !selectedDiscussion ? (
                    <p className="text-sm text-muted-foreground">Unable to load thread.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">{selectedDiscussion.Discussiontitle}</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedDiscussion.Discussioncontent}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {selectedDiscussion.Authorname ? <span>By {selectedDiscussion.Authorname}</span> : null}
                          {selectedDiscussion.Createdat ? (
                            <span>{new Date(selectedDiscussion.Createdat).toLocaleString()}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium">Replies</h3>
                        {selectedDiscussion.Replies.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No replies yet.</p>
                        ) : (
                          selectedDiscussion.Replies.map((reply) => (
                            <ReplyThread key={reply.Replyid} reply={reply} />
                          ))
                        )}
                      </div>

                      {!selectedDiscussion.Discussionlocked && (
                        <form onSubmit={handleReplySubmit} className="space-y-2">
                          <Textarea
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder="Write your reply..."
                            rows={4}
                          />
                          <div className="flex justify-end">
                            <Button type="submit" disabled={submittingReply || !replyText.trim()}>
                              <Send className="mr-2 h-4 w-4" />
                              {submittingReply ? "Posting..." : "Post Reply"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default StudentDiscussions;
