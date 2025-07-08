import React from "react";
import SidebarIcons from "@/components/dashboard/SidebarIcons";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f0fdfa]">
      <SidebarIcons />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
