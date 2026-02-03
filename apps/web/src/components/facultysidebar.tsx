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
import { useSidebar } from "@/context/SidebarContext";

function FacultySidebar() {
  const { courseid: courseidParam } = useParams();
  const courseid = courseidParam || localStorage.getItem("courseid") || "";
  const { isExpanded, collapseSidebar } = useSidebar();

  const navItems = [
    { path: "/faculty_dashboard/", icon: Home, label: "Home" },
    { path: courseid ? `/faculty_syllabus/${courseid}` : null, icon: FileText, label: "Syllabus" },
    { path: courseid ? `/faculty_announcement/${courseid}` : null, icon: Megaphone, label: "Announcements" },
    { path: courseid ? `/faculty_assignment/${courseid}` : null, icon: ClipboardList, label: "Assignments" },
    { path: courseid ? `/faculty_quiz/${courseid}` : null, icon: HelpCircle, label: "Quizzes" },
    { path: courseid ? `/faculty_gradebook/${courseid}` : null, icon: Table2, label: "Gradebook" },
    { path: courseid ? `/faculty_grades/${courseid}` : null, icon: GraduationCap, label: "Grades" },
    { path: courseid ? `/students/${courseid}` : null, icon: Users, label: "Students" },
  ];

  return (
    <nav className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border p-4 transition-all duration-300 ease-in-out z-40 overflow-hidden",
      isExpanded ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
    )}>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.path ? (
              <NavLink
                to={item.path}
                onClick={collapseSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !isExpanded && "justify-center px-1"
                  )
                }
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("transition-opacity duration-200", !isExpanded && "opacity-0 hidden")}>
                  {item.label}
                </span>
              </NavLink>
            ) : (
              <div 
                className={cn(
                  "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed whitespace-nowrap",
                  !isExpanded && "justify-center px-1"
                )}
                title={!isExpanded ? `${item.label} (Select a course first)` : "Select a course first"}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("transition-opacity duration-200", !isExpanded && "opacity-0 hidden")}>
                  {item.label}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default FacultySidebar;
