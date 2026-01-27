import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { companyLogo } from "../assets/images";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    document.body.classList.toggle("sidebar-open");
    document.body.classList.remove("search-open");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Menu button - only show when not on login page */}
        {location.pathname !== "/" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <a href="#" className="flex items-center gap-2 mx-auto md:mx-0">
          <img src={companyLogo} alt="Go-Canvas" className="h-8 w-auto" />
          <h2 className="text-xl font-bold text-primary">Go-Canvas</h2>
        </a>

        {/* Logout button - only show when not on login page */}
        {location.pathname !== "/" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;