import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { FacultyPageLayout } from "@/components/FacultyPageLayout";
import { getApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface GradebookCell {
  Assignmentid: number;
  Assignmentname: string;
  Points_possible: number;
  Score: string | null;
  Status: string;
  Submissionid: number | null;
}

interface GradebookRow {
  Studentid: number;
  Studentname: string;
  Cells: GradebookCell[];
  Course_grade: string | null;
}

interface GradebookResponse {
  Courseid: number;
  Coursename: string;
  Assignment_headers: { Assignmentid: number; Assignmentname: string; Points: number }[];
  Rows: GradebookRow[];
  Apply_late_policy: boolean;
  Curve_to_score: number | null;
}

export default function FacultyGradebook() {
  const { courseid: courseidParam } = useParams();
  const courseid = courseidParam || localStorage.getItem("courseid") || "";
  const [data, setData] = useState<GradebookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyLatePolicy, setApplyLatePolicy] = useState(false);
  const [curveToScore, setCurveToScore] = useState<string>("");
  const [error, setError] = useState("");

  const fetchGradebook = async () => {
    if (!courseid || courseid === "undefined") {
      setError("Select a course from the dashboard first.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      let path = `/gradebook/course/${courseid}?apply_late_policy=${applyLatePolicy}`;
      if (curveToScore.trim()) {
        const curve = parseFloat(curveToScore);
        if (!isNaN(curve)) path += `&curve_to_score=${curve}`;
      }
      const json = await getApi<GradebookResponse>(path);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load gradebook. Check backend and login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradebook();
  }, [courseid, applyLatePolicy]);

  return (
    <>
      <Helmet>
        <title>Gradebook | Go-Canvas</title>
      </Helmet>
      <FacultyPageLayout>
        <div className="w-full max-w-6xl p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
              <p className="text-muted-foreground mt-1">
                {data?.Coursename ? `${data.Coursename} — Students × Assignments` : "View scores and status by assignment"}
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="late-policy"
                    checked={applyLatePolicy}
                    onCheckedChange={setApplyLatePolicy}
                  />
                  <Label htmlFor="late-policy">Apply late policy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="curve">Curve to (max score):</Label>
                  <Input
                    id="curve"
                    type="number"
                    min={1}
                    placeholder="e.g. 100"
                    className="w-24"
                    value={curveToScore}
                    onChange={(e) => setCurveToScore(e.target.value)}
                  />
                </div>
                <Button onClick={fetchGradebook} variant="outline">Refresh</Button>
              </CardContent>
            </Card>

            {error && <p className="text-destructive mb-4">{error}</p>}
            {loading && <p className="text-muted-foreground">Loading gradebook...</p>}
            {!loading && data && (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Student</TableHead>
                      {data.Assignment_headers.map((h) => (
                        <TableHead key={h.Assignmentid} className="text-center min-w-[100px]">
                          {h.Assignmentname} ({h.Points})
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[80px]">Course</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.Rows.map((row) => (
                      <TableRow key={row.Studentid}>
                        <TableCell className="font-medium">{row.Studentname}</TableCell>
                        {row.Cells.map((cell) => (
                          <TableCell key={cell.Assignmentid} className="text-center">
                            {cell.Score != null ? cell.Score : "—"}
                            {cell.Status === "late" && (
                              <span className="block text-xs text-muted-foreground">late</span>
                            )}
                            {cell.Status === "missing" && (
                              <span className="block text-xs text-muted-foreground">missing</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>{row.Course_grade ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!loading && data && data.Rows.length === 0 && (
              <p className="text-muted-foreground">No students enrolled in this course.</p>
            )}
        </div>
      </FacultyPageLayout>
    </>
  );
}
