import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Rolevate",
  description: "Sign in to your Rolevate account to access AI-powered job matching and recruitment tools.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}