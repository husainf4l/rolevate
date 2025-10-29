import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Rolevate",
  description: "Create your Rolevate account to start your AI-powered recruitment journey.",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}