import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { getApi, postApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalendarEvent {
  Eventid: number;
  Eventtitle: string;
  Eventdescription?: string | null;
  Eventtype: string;
  Eventstart: string;
  Eventend?: string | null;
  Eventallday: boolean;
  Eventcolor?: string | null;
  Courseid?: number | null;
  Coursename?: string | null;
}

interface CalendarEventsResponse {
  Totalevents: number;
  Events: CalendarEvent[];
}

interface StudentCourse {
  Courseid: number;
  Coursename: string;
}

function getMonthDateRange(baseDate: Date) {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  return {
    start: firstDay.toISOString().split("T")[0],
    end: lastDay.toISOString().split("T")[0],
  };
}

function StudentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getApi<StudentCourse[]>("/student/view_contents");
        setCourses(data);
      } catch {
        // Optional helper data; keep calendar usable.
      }
    };

    loadCourses();
  }, []);

  const fetchEvents = useCallback(async () => {
    const { start, end } = getMonthDateRange(currentMonth);

    setLoading(true);
    setError("");

    try {
      const filterQuery = courseFilter !== "all" ? `&courseid=${courseFilter}` : "";
      const data = await getApi<CalendarEventsResponse>(
        `/calendar/events?start_date=${start}&end_date=${end}${filterQuery}`
      );
      setEvents(data.Events || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load calendar events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, courseFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const syncCalendar = async () => {
    setSyncing(true);
    setError("");
    try {
      await postApi("/calendar/sync", {});
      await fetchEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync assignment deadlines");
    } finally {
      setSyncing(false);
    }
  };

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();

    for (const event of events) {
      const dateKey = event.Eventstart.split("T")[0];
      const existing = groups.get(dateKey) || [];
      existing.push(event);
      groups.set(dateKey, existing);
    }

    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  return (
    <>
      <Helmet>
        <title>Calendar | Go-Canvas</title>
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
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground mt-1">Deadlines, quizzes, and events for your courses</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={syncCalendar} disabled={syncing}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {syncing ? "Syncing..." : "Sync Deadlines"}
                </Button>
                <Button variant="outline" onClick={fetchEvents} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>
                      {currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={courseFilter === "all" ? "default" : "outline"}
                      onClick={() => setCourseFilter("all")}
                    >
                      All Courses
                    </Button>
                    {courses.map((course) => (
                      <Button
                        key={course.Courseid}
                        size="sm"
                        variant={courseFilter === String(course.Courseid) ? "default" : "outline"}
                        onClick={() => setCourseFilter(String(course.Courseid))}
                      >
                        {course.Coursename}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading events...</p>
                ) : groupedEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events in this month.</p>
                ) : (
                  <div className="space-y-4">
                    {groupedEvents.map(([date, dateEvents]) => (
                      <div key={date} className="rounded-md border">
                        <div className="px-4 py-2 border-b bg-muted/40">
                          <p className="font-medium">{new Date(`${date}T00:00:00`).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 space-y-2">
                          {dateEvents.map((event) => (
                            <div key={event.Eventid} className="rounded-md border p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-medium">{event.Eventtitle}</p>
                                  <Badge variant="outline" className="capitalize">
                                    {event.Eventtype}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    {event.Eventallday
                                      ? "All day"
                                      : new Date(event.Eventstart).toLocaleTimeString([], {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })}
                                  </span>
                                </div>
                              </div>

                              {event.Coursename && (
                                <p className="text-xs text-muted-foreground mt-1">{event.Coursename}</p>
                              )}

                              {event.Eventdescription && (
                                <p className="text-sm text-muted-foreground mt-2">{event.Eventdescription}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default StudentCalendar;
