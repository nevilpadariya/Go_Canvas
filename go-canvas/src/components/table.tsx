import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(
  name: string,
  contact: string,
  course: string,
  semester: string,
  
) {
  return { name, contact, course, semester };
}

const rows = [
  createData('Student 1', '123-456-789', 'Course ID', 'Spring-24'),
  createData('Student 2', '123-456-789', 'Course ID', 'Spring-24'),
];

export default function StudentTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Contact</TableCell>
            <TableCell align="right">Course</TableCell>
            <TableCell align="right">Semester</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.contact}</TableCell>
              <TableCell align="right">{row.course}</TableCell>
              <TableCell align="right">{row.semester}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
