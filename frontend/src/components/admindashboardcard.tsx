import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardCardProps {
  coursename: string;
  coursesemester: string;
  facultyname: string;
}

export default function DashboardCardAdmin({
  coursename,
  coursesemester,
  facultyname,
}: DashboardCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{coursename}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{coursesemester}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Instructor: {facultyname}
        </p>
      </CardContent>
    </Card>
  );
}