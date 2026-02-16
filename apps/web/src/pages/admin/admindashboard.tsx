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
import { ArrowUpDown, Users as UsersIcon, BookOpen as BookOpenIcon, FileText as FileTextIcon, Trash2 } from "lucide-react";

interface User {
  Userid: number;
  Useremail: string;
  Userrole: string;
  Userfirstname: string;
  Userlastname: string;
  Createdat?: string;
  Isactive: boolean;
}

interface AnalyticsData {
  total_users: number;
  total_courses: number;
  total_students: number;
  total_faculty: number;
  submissions_last_7_days: number;
  submissions_last_30_days: number;
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/view_courses_by_faculty`,
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
          `${import.meta.env.VITE_API_URL}/admin/users`,
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

    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    if (token) {
      fetchCourses();
      fetchUsers();
      fetchAnalytics();
    }
  }, [token]);

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        { Coursename: newCourseName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCourseName("");
      setShowCreateModal(false);
      // Reload courses
      window.location.reload(); 
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.Userfirstname}?`)) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${user.Userid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.Userid === user.Userid ? { ...u, Isactive: false } : u));
    } catch (error) {
       console.error("Error deleting user:", error);
       alert("Failed to deactivate user");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`,
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
            


          </div>
        </MainContentWrapper>
      </div>

       {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <input 
              className="w-full border rounded p-2 mb-4 bg-transparent"
              placeholder="Course Name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateCourse}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboardPage;
