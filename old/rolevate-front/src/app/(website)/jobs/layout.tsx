import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs - Rolevate | Find Your Dream Job with AI-Powered Matching",
  description: "Discover thousands of job opportunities with Rolevate's AI-powered job matching platform. Find your perfect role across various industries and experience levels.",
  alternates: {
    canonical: "https://rolevate.com/jobs",
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

