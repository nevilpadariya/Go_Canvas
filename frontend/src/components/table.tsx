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

interface Student {
  Courseid: string;
  Coursename: string;
  Coursesemester: string;
  Studentcontactnumber: string;
  Studentfirstname: string;
  Studentid: string;
  Studentlastname: string;
}

interface Row {
  studentfirstname: string;
  studentlastname: string;
  studentcontactnumber: string;
  coursesemester: string;
}

function createRow(student: Student): Row {
  const { Studentfirstname, Studentlastname, Studentcontactnumber, Coursesemester } = student;
  return {
    studentfirstname: Studentfirstname,
    studentlastname: Studentlastname,
    studentcontactnumber: Studentcontactnumber,
    coursesemester: Coursesemester,
  };
}

const StudentTable: React.FC<{ students: Student[] }> = ({ students }) => {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row: Row, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {row.studentfirstname} {row.studentlastname}
                </TableCell>
                <TableCell className="text-right">{row.studentcontactnumber}</TableCell>
                <TableCell className="text-right">{row.coursesemester}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StudentTable;
