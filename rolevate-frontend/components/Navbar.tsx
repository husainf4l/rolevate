"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="relative">
      <nav className="bg-[#1E293B]/95 backdrop-blur-sm text-[#F8FAFC] px-6 py-4 shadow-xl fixed top-0 left-0 right-0 z-50 border-b border-[#334155]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-20"
          >
            <div className="relative w-36 h-8 flex items-center justify-center">
              <Image
                src="/images/rolevate-logo.png"
                alt="Rolevate AI Logo"
                width={128}
                height={128}
                className="relative z-10 rounded-full"
              />
            </div>
          </Link>

          {/* CTA Button - visible on all devices */}
          <div>
            <Link
              href="/try-it-now"
              className="group relative overflow-hidden bg-[#00C6AD] text-[#0F172A] font-semibold px-6 py-2.5 rounded-lg"
            >
              <span className="relative z-10 text-white transition-colors duration-300">
                Try Demo
              </span>
              <span className="absolute inset-0 bg-[#0F172A] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Add padding to prevent content from hiding behind the fixed navbar */}
      <div className="h-16"></div>
    </header>
  );
}
