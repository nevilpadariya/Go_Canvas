import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardCardProps {
  courseid: string;
  coursename: string;
  coursedescription: string;
  coursesemester: string;
  buttondisabled: boolean;
}

export default function DashboardCardFaculty({
  courseid,
  coursename,
  coursedescription,
  coursesemester,
  buttondisabled,
}: DashboardCardProps) {
  const url = `/coursefaculty/${courseid}`;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{courseid}</Badge>
          <Badge variant="outline">{coursesemester}</Badge>
        </div>
        <CardTitle className="text-lg mt-2">{coursename}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {coursedescription}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          size="sm"
          className="w-full"
          disabled={buttondisabled}
          asChild={!buttondisabled}
        >
          {buttondisabled ? (
            <span>View Content</span>
          ) : (
            <Link to={url} className="flex items-center justify-center gap-2">
              View Content
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
