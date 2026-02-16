import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  CircleDot,
  File,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Lock,
  RefreshCw,
} from "lucide-react";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { getApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentCourse {
  Courseid: number;
  Coursename: string;
  Coursedescription?: string;
  Coursesemester?: string;
  EnrollmentSemester?: string;
}

interface ModuleItem {
  Itemid: number;
  Itemname: string;
  Itemtype: string;
  Itemcontent?: string | null;
  Itemurl?: string | null;
  Referenceid?: number | null;
  Unlockat?: string | null;
  Prerequisiteitemids?: string | null;
  Locked: boolean;
  Referenceinfo?: {
    id?: number;
    name?: string;
    description?: string;
    url?: string;
  } | null;
}

interface CourseModule {
  Moduleid: number;
  Modulename: string;
  Moduledescription?: string | null;
  Moduleposition: number;
  Modulepublished: boolean;
  Items: ModuleItem[];
}

interface ModuleListResponse {
  Courseid: number;
  Coursename?: string;
  Totalmodules: number;
  Modules: CourseModule[];
}

function parsePrerequisites(raw?: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

function getItemIcon(itemType: string) {
  switch (itemType) {
    case "assignment":
      return <FileText className="h-4 w-4" />;
    case "quiz":
      return <GraduationCap className="h-4 w-4" />;
    case "file":
      return <File className="h-4 w-4" />;
    case "link":
      return <LinkIcon className="h-4 w-4" />;
    default:
      return <CircleDot className="h-4 w-4" />;
  }
}

function StudentModules() {
  const { courseid: courseIdParam } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseIdParam || localStorage.getItem("courseid") || ""
  );
  const [modulesData, setModulesData] = useState<ModuleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseIdParam && courseIdParam !== selectedCourseId) {
      setSelectedCourseId(courseIdParam);
    }
  }, [courseIdParam, selectedCourseId]);

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
        setError(e instanceof Error ? e.message : "Failed to load enrolled courses");
      }
    };

    loadCourses();
  }, []);

  const fetchModules = async (courseId: string) => {
    if (!courseId) {
      setLoading(false);
      setModulesData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getApi<ModuleListResponse>(`/modules/course/${courseId}`);
      setModulesData(data);
      localStorage.setItem("courseid", courseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load modules");
      setModulesData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules(selectedCourseId);
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.Courseid) === selectedCourseId),
    [courses, selectedCourseId]
  );

  const handleCourseSwitch = (courseId: string) => {
    setSelectedCourseId(courseId);
    navigate(`/student/modules/${courseId}`);
  };

  const openFileUrl = (url?: string | null) => {
    if (!url) return;
    const baseUrl = import.meta.env.VITE_API_URL;
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const handleItemOpen = (item: ModuleItem) => {
    if (item.Locked) return;

    if (item.Itemtype === "assignment" && item.Referenceid) {
      navigate(`/student/assignment/${item.Referenceid}`);
      return;
    }

    if (item.Itemtype === "quiz" && item.Referenceid) {
      navigate(`/student/quiz/${item.Referenceid}`);
      return;
    }

    if (item.Itemtype === "link") {
      openFileUrl(item.Itemurl);
      return;
    }

    if (item.Itemtype === "file") {
      openFileUrl(item.Referenceinfo?.url || item.Itemurl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Modules | Go-Canvas</title>
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
                <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
                <p className="text-muted-foreground mt-1">
                  {selectedCourse?.Coursename || modulesData?.Coursename || "Select a course to view module sequence"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchModules(selectedCourseId)}
                disabled={!selectedCourseId || loading}
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

            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">Loading modules...</CardContent>
              </Card>
            ) : !selectedCourseId ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">No course selected.</CardContent>
              </Card>
            ) : !modulesData || modulesData.Modules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No modules published for this course yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modulesData.Modules.map((module) => (
                  <Card key={module.Moduleid}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-xl">{module.Modulename}</CardTitle>
                          {module.Moduledescription && (
                            <p className="text-sm text-muted-foreground mt-1">{module.Moduledescription}</p>
                          )}
                        </div>
                        <Badge variant={module.Modulepublished ? "default" : "secondary"}>
                          {module.Modulepublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {module.Items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No items in this module.</p>
                      ) : (
                        module.Items.map((item) => {
                          const prerequisites = parsePrerequisites(item.Prerequisiteitemids);
                          const hasAction =
                            item.Itemtype === "assignment" ||
                            item.Itemtype === "quiz" ||
                            item.Itemtype === "file" ||
                            item.Itemtype === "link";

                          return (
                            <button
                              type="button"
                              key={item.Itemid}
                              onClick={() => handleItemOpen(item)}
                              disabled={item.Locked || !hasAction}
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between rounded-lg border px-3 py-3 hover:bg-accent/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="mt-0.5 text-muted-foreground">{getItemIcon(item.Itemtype)}</div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-medium truncate">{item.Itemname}</p>
                                      <Badge variant="outline" className="capitalize">
                                        {item.Itemtype}
                                      </Badge>
                                    </div>
                                    {item.Itemcontent && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.Itemcontent}</p>
                                    )}
                                    {item.Unlockat && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Unlocks: {new Date(item.Unlockat).toLocaleString()}
                                      </p>
                                    )}
                                    {prerequisites.length > 0 && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Prerequisites: {prerequisites.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.Locked ? (
                                    <Badge variant="secondary" className="gap-1">
                                      <Lock className="h-3 w-3" />
                                      Locked
                                    </Badge>
                                  ) : (
                                    <Badge variant="default">Available</Badge>
                                  )}
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default StudentModules;
