import React from "react";
import Header from "./header";
import FacultySidebar from "./facultysidebar";
import { cn } from "@/lib/utils";

export function FacultyPageLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 hidden sidebar-overlay"
        onClick={() => document.body.classList.remove("sidebar-open")}
        aria-hidden
      />
      <Header />
      <FacultySidebar />
      <main
        className={cn(
          "pt-16 transition-all duration-200 min-h-[calc(100vh-4rem)]",
          "pl-0 md:pl-64",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
