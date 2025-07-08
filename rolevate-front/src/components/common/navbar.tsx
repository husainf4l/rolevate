"use client";

import React, { useState } from "react";
import Logo from "./logo";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/30 shadow-xs">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <Logo size={42} />
          </Link>
          <nav className="hidden items-center gap-10 text-sm font-medium md:flex">
            <Link
              href="/jobs"
              className="font-text text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Jobs
            </Link>
            <Link
              href="/corporates"
              className="font-text text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Corporates
            </Link>
            <Link
              href="/employers"
              className="font-text text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              For Employers
            </Link>
            <Link
              href="/about"
              className="font-text text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="font-text text-gray-700 hover:text-primary-600 transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button 
              variant="primary" 
              size="sm" 
              href="/login"
              className="hidden md:inline-flex rounded-full shadow-sm px-6 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200"
            >
              Sign In
            </Button>
            <button 
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/60 text-gray-700 hover:bg-gray-200/80 hover:text-primary-600 transition-all duration-300 md:hidden border border-gray-200/50 backdrop-blur-sm hover:scale-110"
            >
              {isMenuOpen ? (
                <svg
                  className="h-5 w-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeMenu}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/40 shadow-lg md:hidden animate-slide-up">
            <nav className="container mx-auto px-6 py-8">
              <div className="flex flex-col gap-1">
                <Link
                  href="/jobs"
                  className="font-text text-gray-700 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95"
                  onClick={closeMenu}
                >
                  Jobs
                </Link>
                <Link
                  href="/corporates"
                  className="font-text text-gray-700 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95"
                  onClick={closeMenu}
                >
                  Corporates
                </Link>
                <Link
                  href="/employers"
                  className="font-text text-gray-700 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95"
                  onClick={closeMenu}
                >
                  For Employers
                </Link>
                <Link
                  href="/about"
                  className="font-text text-gray-700 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95"
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="font-text text-gray-700 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95"
                  onClick={closeMenu}
                >
                  Contact
                </Link>
                <div className="pt-6 border-t border-gray-200/60 mt-4">
                  <Button 
                    variant="primary" 
                    size="md" 
                    href="/login"
                    fullWidth
                    onClick={closeMenu}
                    className="rounded-full py-3 text-base font-medium bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-sm"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
