import React from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  NotebookTabs,
  Trophy,
  User,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

function Sidebar() {

  const { isExpanded } = useSidebar();
  const selectedCourseId = localStorage.getItem("courseid") || "";

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: selectedCourseId ? `/student/modules/${selectedCourseId}` : "/student/modules",
      icon: NotebookTabs,
      label: "Modules",
    },
    {
      path: "/student/assignments",
      icon: FileText,
      label: "Assignments",
    },
    {
      path: selectedCourseId ? `/student/discussions/${selectedCourseId}` : "/student/discussions",
      icon: MessageSquare,
      label: "Discussions",
    },
    {
      path: "/student/grades",
      icon: Trophy,
      label: "Grades",
    },
    {
      path: "/student/calendar",
      icon: Calendar,
      label: "Calendar",
    },
    {
      path: "/student/inbox",
      icon: Inbox,
      label: "Inbox",
    },
    {
      path: "/account",
      icon: User,
      label: "Account",
    },
  ];

  return (
    <nav className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border p-4 transition-all duration-300 ease-in-out z-40 overflow-hidden",
        isExpanded ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
    )}>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-2 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isExpanded && "justify-center px-2"
                )
              }
              title={!isExpanded ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn("transition-opacity duration-200", !isExpanded && "opacity-0 hidden")}>
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
