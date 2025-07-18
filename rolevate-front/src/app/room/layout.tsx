"use client";

import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout for interview rooms - no header, no footer, just the room content
  // This layout forces client-side rendering to avoid hydration issues
  return (
    <div className={`${inter.className} bg-gray-900 min-h-screen`}>
      {children}
    </div>
  );
}
