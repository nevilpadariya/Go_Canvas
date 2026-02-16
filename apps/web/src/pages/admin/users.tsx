import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import Header from "../../components/header";
import AdminSidebar from "../../components/adminsidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
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
import { ArrowUpDown, Trash2, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface User {
  Userid: number;
  Useremail: string;
  Userrole: string;
  Userfirstname: string;
  Userlastname: string;
  Createdat?: string;
  Isactive: boolean;
}

function AdminUsersPage() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState<User[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    actionLabel: string;
    cancelLabel: string;
    variant: 'default' | 'destructive';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "Continue",
    cancelLabel: "Cancel",
    variant: 'default',
    onConfirm: async () => {},
  });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
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

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleDeactivateUser = (user: User) => {
    setAlertConfig({
      isOpen: true,
      title: "Deactivate User?",
      description: (
        <span>
          Are you sure you want to deactivate <strong>{user.Userfirstname} {user.Userlastname}</strong>? 
          They will not be able to log in until reactivated.
        </span>
      ),
      actionLabel: "Deactivate",
      cancelLabel: "Cancel",
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/admin/users/${user.Userid}/deactivate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUsers(users.map(u => u.Userid === user.Userid ? { ...u, Isactive: false } : u));
          closeAlert();
        } catch (error) {
           console.error("Error deactivating user:", error);
           alert("Failed to deactivate user");
        }
      }
    });
  };

  const handleActivateUser = (user: User) => {
    setAlertConfig({
      isOpen: true,
      title: "Activate User",
      description: `Restore access for ${user.Userfirstname}? They will be able to log in again.`,
      actionLabel: "Activate",
      cancelLabel: "Cancel",
      variant: 'default',
      onConfirm: async () => {
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/admin/users/${user.Userid}/activate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUsers(users.map(u => u.Userid === user.Userid ? { ...u, Isactive: true } : u));
          closeAlert();
        } catch (error) {
           console.error("Error activating user:", error);
           alert("Failed to activate user");
        }
      }
    });
  };

  const handleHardDeleteUser = (user: User) => {
    setAlertConfig({
      isOpen: true,
      title: "Permanently Delete User?",
      description: (
        <div className="flex flex-col gap-2">
            <span className="text-red-500 font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Warning: User data will be lost forever.
            </span>
            <span>
                This action cannot be undone. All grades, enrollments, and submissions for 
                <strong> {user.Userfirstname}</strong> will be permanently removed.
            </span>
        </div>
      ),
      actionLabel: "Delete Forever",
      cancelLabel: "Cancel",
      variant: 'destructive',
      onConfirm: async () => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/users/${user.Userid}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.filter(u => u.Userid !== user.Userid));
            closeAlert();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user permanently");
        }
      }
    });
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
        <title>User Management | Go-Canvas</title>
      </Helmet>

      <Dialog open={alertConfig.isOpen} onOpenChange={closeAlert}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{alertConfig.title}</DialogTitle>
                <DialogDescription className="pt-2">
                    {alertConfig.description}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeAlert}>
                    {alertConfig.cancelLabel}
                </Button>
                <Button 
                    variant={alertConfig.variant} 
                    onClick={alertConfig.onConfirm}
                >
                    {alertConfig.actionLabel}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage system users, assign roles, and deactivate accounts</p>
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
                      <TableHead>Joined</TableHead>
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
                          {user.Createdat ? new Date(user.Createdat).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          {user.Userrole !== 'Admin' && (
                           <div className="flex items-center gap-2">
                            <Select 
                              value={user.Userrole} 
                              onValueChange={(val) => handleRoleChange(user.Userid, val)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Faculty">Faculty</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {user.Isactive ? (
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => handleDeactivateUser(user)} 
                                 title="Deactivate (Soft Delete)"
                                 className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 h-8 w-8 p-0"
                               >
                                 <Ban className="h-4 w-4" />
                               </Button>
                            ) : (
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => handleActivateUser(user)} 
                                 title="Activate User"
                                 className="text-green-500 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                               >
                                 <CheckCircle className="h-4 w-4" />
                               </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleHardDeleteUser(user)} 
                              title="Permanently Delete"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                           </div>
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

export default AdminUsersPage;
