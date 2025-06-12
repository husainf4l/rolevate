"use client";

import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a minimal layout with no header and no footer
  return <div className={`${inter.className}`}>{children}</div>;
}
