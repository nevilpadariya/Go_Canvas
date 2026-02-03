import React from "react";
import Header from "./header";
import FacultySidebar from "./facultysidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export function FacultyPageLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isExpanded, collapseSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-all duration-300",
          isExpanded ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={collapseSidebar}
        aria-hidden
      />
      <Header />
      <FacultySidebar />
      <main
        className={cn(
          "pt-16 transition-all duration-300 min-h-[calc(100vh-4rem)]",
          isExpanded ? "md:pl-64" : "md:pl-16",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
