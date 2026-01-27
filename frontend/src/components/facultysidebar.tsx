import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Megaphone, 
  ClipboardList, 
  HelpCircle, 
  GraduationCap, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

function FacultySidebar() {
  const { courseid } = useParams();

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
  };

  const navItems = [
    { path: "/faculty_dashboard/", icon: Home, label: "Home" },
    { path: `/faculty_syllabus/${courseid}`, icon: FileText, label: "Syllabus" },
    { path: `/faculty_announcement/${courseid}`, icon: Megaphone, label: "Announcements" },
    { path: `/faculty_assignment/${courseid}`, icon: ClipboardList, label: "Assignments" },
    { path: `/faculty_quiz/${courseid}`, icon: HelpCircle, label: "Quizzes" },
    { path: `/faculty_grades/${courseid}`, icon: GraduationCap, label: "Grades" },
    { path: `/students/${courseid}`, icon: Users, label: "Students" },
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
