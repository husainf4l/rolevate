import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Room - Rolevate",
  description: "AI-powered interview experience",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
