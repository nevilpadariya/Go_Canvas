import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import Header from "../../components/header";
import AdminSidebar from "../../components/adminsidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import DashboardCardAdmin from "../../components/admindashboardcard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface User {
  Userid: number;
  Useremail: string;
  Userrole: string;
  Userfirstname: string;
  Userlastname: string;
}

interface Course {
  Courseid?: number;
  Coursename: string;
  Faculty: string;
  Coursesemester: string;
}

function AdminDashboardPage() {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);


  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/view_courses_by_faculty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          const coursesData = response.data.map((course: {
            Courseid: any;
            Coursename: any;
            Facultyfirstname: any;
            Facultylastname: any;
            Coursesemester: any;
          }) => {
            const { Courseid, Coursename, Facultyfirstname, Facultylastname, Coursesemester } = course;
            const facultyName = `${Facultyfirstname} ${Facultylastname}`;
            return {
              Courseid,
              Coursename,
              Faculty: facultyName,
              Coursesemester
            };
          });

          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (token) {
      fetchCourses();
      fetchUsers();
    }
  }, [token]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        user.Userid === userId ? { ...user, Userrole: newRole } : user
      ));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role");
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>
        
        <Header />
        <AdminSidebar />
        
        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of Courses, Users, and Students</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {courses.map((course, index) => (
                <div key={index}>
                  <DashboardCardAdmin 
                    coursename={course.Coursename}
                    coursesemester={course.Coursesemester}
                    facultyname={course.Faculty}
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight">User Management</h2>
              <p className="text-muted-foreground">Manage users and assign roles</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('Userid')}
                          className="flex items-center gap-2 hover:bg-transparent px-0"
                        >
                          ID
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[150px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('Userrole')}
                          className="flex items-center gap-2 hover:bg-transparent px-0"
                        >
                          Current Role
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user) => (
                      <TableRow key={user.Userid}>
                        <TableCell className="font-medium">{user.Userid}</TableCell>
                        <TableCell>
                          {user.Userfirstname} {user.Userlastname}
                        </TableCell>
                        <TableCell>{user.Useremail}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.Userrole === 'Admin' ? 'default' : 
                              user.Userrole === 'Faculty' ? 'secondary' : 'outline'
                            }
                            className={
                              user.Userrole === 'Admin' ? 'bg-red-500 hover:bg-red-600' :
                              user.Userrole === 'Faculty' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                              'bg-green-500 text-white hover:bg-green-600'
                            }
                          >
                            {user.Userrole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.Userrole !== 'Admin' && (
                            <Select 
                              value={user.Userrole} 
                              onValueChange={(val) => handleRoleChange(user.Userid, val)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Faculty">Faculty</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default AdminDashboardPage;
