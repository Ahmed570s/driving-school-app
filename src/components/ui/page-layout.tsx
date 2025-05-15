import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  children,
  className,
  ...props
}: PageLayoutProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
} 