import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

function Sidebar() {
  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/account",
      icon: User,
      label: "Account",
    },
  ];

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border p-4 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out sidebar-open:translate-x-0 z-40">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;