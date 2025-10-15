"use client";

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  // Helper function to check if current path is active
  const isActivePage = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeUserMenu = () => {
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/30 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
          >
            <Logo size={120} />
          </Link>
          
          <nav className="hidden items-center gap-10 text-sm font-medium md:flex">
            <Link
              href="/"
              className={`transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Home
            </Link>

            <Link
              href="/jobs"
              className={`transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/jobs")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Jobs
            </Link>

            <Link
              href="/employers"
              className={`transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/employers")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              For Employers
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="hidden md:flex items-center gap-3 px-4 py-2 rounded-md bg-gray-100/60 hover:bg-gray-200/80 transition-all duration-200 border border-gray-200/50 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {user.name || user.email || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.userType === "CANDIDATE" ? "Job Seeker" : "Employer"}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={closeUserMenu}
                    />
                    <div
                      className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-200/50 z-50 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b border-gray-200/60">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <div className="border-t border-gray-200/60 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors w-full text-left"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Not authenticated - show sign in and sign up buttons
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-5 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            <button
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100/60 text-gray-700 hover:bg-gray-200/80 hover:text-primary-600 transition-all duration-300 md:hidden border border-gray-200/50 backdrop-blur-sm"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  className="h-5 w-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/40 shadow-lg md:hidden">
            <nav className="container mx-auto px-6 py-8">
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  className={`hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl ${
                    isActivePage("/")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  Home
                </Link>

                <Link
                  href="/jobs"
                  className={`hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl ${
                    isActivePage("/jobs")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  Jobs
                </Link>

                <Link
                  href="/employers"
                  className={`hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl ${
                    isActivePage("/employers")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  For Employers
                </Link>
                
                <div className="pt-6 border-t border-gray-200/60 mt-4">
                  {user ? (
                    // Authenticated user mobile menu
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">
                            {user.name || user.email || 'User'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {user.userType === "CANDIDATE" ? "Job Seeker" : "Employer"}
                          </span>
                        </div>
                      </div>

                      <Link href="/dashboard">
                        <button
                          onClick={closeMenu}
                          className="w-full rounded-md py-2.5 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all duration-200 shadow-sm"
                        >
                          Go to Dashboard
                        </button>
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full py-3 px-4 text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-xl font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    // Not authenticated mobile menu
                    <div className="space-y-3">
                      <Link href="/login">
                        <button
                          onClick={closeMenu}
                          className="w-full rounded-md py-3 text-base font-medium border border-primary-600 text-primary-600 hover:bg-primary-50 transition-all duration-300"
                        >
                          Sign In
                        </button>
                      </Link>
                      <Link href="/signup">
                        <button
                          onClick={closeMenu}
                          className="w-full rounded-md py-3 text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}