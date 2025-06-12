"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./logo/logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative">
      <nav className="bg-gray-900/95 backdrop-blur-xl text-white px-6 py-3 fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo
              size={32}
              textColorLight="#ffffff"
              textColorAccent="#2DD4BF"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/jobs?isFeatured=true"
              className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium"
            >
              Featured
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {/* Login and Signup buttons */}
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-700"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-600/25"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/jobs"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link
                href="/jobs?isFeatured=true"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Featured
              </Link>

              {/* Mobile Auth buttons */}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-800">
                <Link
                  href="/login"
                  className="text-center bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-center bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </header>
  );
}
