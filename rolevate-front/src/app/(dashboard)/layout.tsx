import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f0fdfa] text-[#23272a] min-h-screen">
        {children}
      </body>
    </html>
  );
}
