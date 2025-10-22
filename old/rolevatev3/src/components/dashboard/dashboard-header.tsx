"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import UserMenu from "@/components/dashboard/user-menu";
import ThemeSwitcher from "@/components/common/themeSwitcher";

interface DashboardHeaderProps {
  locale: string;
}

export default function DashboardHeader({ locale }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <SidebarTrigger className="mr-4" />

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={locale === "ar" ? "البحث في الوظائف..." : "Search jobs..."}
              className="pl-9 pr-4"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/dashboard/notifications`}>
              <Bell className="h-4 w-4" />
            </Link>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Menu */}
          <UserMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}