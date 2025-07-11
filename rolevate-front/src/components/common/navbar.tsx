"use client";

import React, { useState, useEffect } from "react";
import Logo from "./logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { getCurrentUser, logout } from "@/services/auth";

interface User {
  id: string;
  email: string;
  name: string;
  userType: "COMPANY" | "CANDIDATE";
  phone?: string;
  company?: any;
  companyId?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  const checkAuthStatus = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setShowUserMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.userType === "CANDIDATE" ? "/userdashboard" : "/dashboard";
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/30 shadow-xs">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
          >
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
            {user ? (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100/60 hover:bg-gray-200/80 transition-all duration-200 border border-gray-200/50 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 font-display">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 font-text">
                      {user.userType === "CANDIDATE"
                        ? "Job Seeker"
                        : "Employer"}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
                      className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 z-50 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b border-gray-200/60">
                        <p className="text-sm font-medium text-gray-900 font-display">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 font-text">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors font-text"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          Dashboard
                        </Link>
                        {user.userType === "CANDIDATE" && (
                          <Link
                            href="/userdashboard/profile"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors font-text"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profile
                          </Link>
                        )}
                        {user.userType === "COMPANY" && (
                          <Link
                            href="/dashboard/company-profile"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors font-text"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Company Profile
                          </Link>
                        )}
                        <div className="border-t border-gray-200/60 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors w-full text-left font-text"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
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
              // Not authenticated - show sign in button
              <Button
                variant="primary"
                size="sm"
                href="/login"
                className="hidden md:inline-flex rounded-full shadow-sm px-6 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Button>
            )}

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
                  {user ? (
                    // Authenticated user mobile menu
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900 font-display">
                            {user.name}
                          </span>
                          <span className="text-sm text-gray-500 font-text">
                            {user.userType === "CANDIDATE"
                              ? "Job Seeker"
                              : "Employer"}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        href={getDashboardLink()}
                        fullWidth
                        onClick={closeMenu}
                        className="rounded-full py-3 text-base font-medium bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-sm"
                      >
                        Go to Dashboard
                      </Button>

                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full py-3 px-4 text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-xl font-medium font-text"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    // Not authenticated mobile menu
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
