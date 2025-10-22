import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardContent from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard - Rolevate",
  description: "Your personal recruitment dashboard",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CandidateSidebar locale={locale} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DashboardHeader locale={locale} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <DashboardContent locale={locale} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
