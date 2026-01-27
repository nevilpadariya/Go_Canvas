import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Student {
  Coursename: string;
  Coursesemester: string;
  Studentcontactnumber: string;
  Studentid: string;
  Studentname: string;
  Coursegrade: string;
}

interface Row {
  studentfirstname: string;
  studentcontactnumber: string;
  coursesemester: string;
  coursegrade: string;
}

function createRow(student: Student): Row {
  const { Studentname, Studentcontactnumber, Coursesemester, Coursegrade } = student;
  return {
    studentfirstname: Studentname,
    studentcontactnumber: Studentcontactnumber,
    coursesemester: Coursesemester,
    coursegrade: Coursegrade,
  };
}

const FacultyStudentTable: React.FC<{ students: Student[] }> = ({ students }) => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (students && Array.isArray(students)) {
      const mappedRows = students.map(createRow);
      setRows(mappedRows);
    }
  }, [students]);

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Contact</TableHead>
            <TableHead className="text-right">Semester</TableHead>
            <TableHead className="text-right">Grades</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row: Row, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.studentfirstname}</TableCell>
                <TableCell className="text-right">{row.studentcontactnumber}</TableCell>
                <TableCell className="text-right">{row.coursesemester}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.coursegrade ? "default" : "secondary"}>
                    {row.coursegrade || "N/A"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default FacultyStudentTable;
