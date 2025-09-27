import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Setup - Rolevate",
  description: "Set up your company profile to get started with recruiting",
};

export default function SetupCompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {children}
    </div>
  );
}
