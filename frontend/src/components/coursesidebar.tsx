import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Megaphone, ClipboardList, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

function CourseSidebar() {
  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
  };

  const navItems = [
    { path: "/faculty_dashboard", icon: Home, label: "Home" },
    { path: "/faculty_announcement", icon: Megaphone, label: "Announcements" },
    { path: "/faculty_assignment", icon: ClipboardList, label: "Assignments" },
    { path: "/faculty_grades", icon: GraduationCap, label: "Grades" },
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

export default CourseSidebar;
