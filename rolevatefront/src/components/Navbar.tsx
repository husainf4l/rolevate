"use client";
import Link from "next/link";
import Logo from "./logo/logo";

export default function Navbar() {
  return (
    <header className="relative">
      <nav className="bg-gray-900/90 backdrop-blur-xl text-white px-6 py-3 fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={32} textColorLight="#ffffff" textColorAccent="#2DD4BF" />

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Jobs
            </Link>
            <Link
              href="/jobs?isFeatured=true"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Featured
            </Link>
          </div>

          {/* CTA Button */}
          <div>
            <Link
              href="/try-it-now"
              className="group bg-teal-600 hover:bg-teal-500 text-white font-medium px-5 py-2 rounded-full text-sm transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-14"></div>
    </header>
  );
}
