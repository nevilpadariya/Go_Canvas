import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

function AdminSidebar() {

  const { isExpanded } = useSidebar();

  const navItems = [
    { path: "/admin_dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/assign_course", icon: BookOpen, label: "Courses" },
    { path: "/student_list", icon: Users, label: "Students" },
  ];

  return (
    <nav className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border p-4 transition-all duration-300 ease-in-out z-40 overflow-hidden",
         isExpanded ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
    )}>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                   !isExpanded && "justify-center px-2"
                )
              }
              title={!isExpanded ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
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

export default AdminSidebar;
