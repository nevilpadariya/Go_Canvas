import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Megaphone, 
  ClipboardList, 
  HelpCircle, 
  GraduationCap, 
  Table2,
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

function FacultySidebar() {
  const { courseid: courseidParam } = useParams();
  const courseid = courseidParam || localStorage.getItem("courseid") || "";

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
  };

  const navItems = [
    { path: "/faculty_dashboard/", icon: Home, label: "Home" },
    { path: courseid ? `/faculty_syllabus/${courseid}` : "/faculty_dashboard/", icon: FileText, label: "Syllabus" },
    { path: courseid ? `/faculty_announcement/${courseid}` : "/faculty_dashboard/", icon: Megaphone, label: "Announcements" },
    { path: courseid ? `/faculty_assignment/${courseid}` : "/faculty_dashboard/", icon: ClipboardList, label: "Assignments" },
    { path: courseid ? `/faculty_quiz/${courseid}` : "/faculty_dashboard/", icon: HelpCircle, label: "Quizzes" },
    { path: courseid ? `/faculty_gradebook/${courseid}` : "/faculty_dashboard/", icon: Table2, label: "Gradebook" },
    { path: courseid ? `/faculty_grades/${courseid}` : "/faculty_dashboard/", icon: GraduationCap, label: "Grades" },
    { path: courseid ? `/students/${courseid}` : "/faculty_dashboard/", icon: Users, label: "Students" },
  ];

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border p-4 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out z-40">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default FacultySidebar;
