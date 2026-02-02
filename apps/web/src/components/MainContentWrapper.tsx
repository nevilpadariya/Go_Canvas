import React, { ReactNode } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface MainContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MainContentWrapper = ({ children, className }: MainContentWrapperProps) => {
  const { isExpanded } = useSidebar();

  return (
    <main
      className={cn(
        "transition-all duration-300 ease-in-out",
        isExpanded ? "md:pl-64" : "md:pl-16",
        className
      )}
    >
      {children}
    </main>
  );
};
