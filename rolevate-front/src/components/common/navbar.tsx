"use client";

import React, { useState, useEffect } from "react";
import Logo from "./logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import { API_CONFIG } from "@/lib/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTachometerAlt, faUser, faBuilding, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      // Force a page reload to reset all auth state
      window.location.href = "/";
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
            <Logo size={46} />
          </Link>
          <nav className="hidden items-center gap-10 text-sm font-medium md:flex">
            <Link
              href="/"
              className={`font-text transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Home
            </Link>

            <Link
              href="/jobs"
              className={`font-text transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/jobs")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Jobs
            </Link>

            <Link
              href="/employers"
              className={`font-text transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/employers")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              For Employers
            </Link>
            <Link
              href="/about"
              className={`font-text transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/about")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`font-text transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${
                isActivePage("/contact")
                  ? "text-primary-600 after:w-full"
                  : "text-gray-700 hover:text-primary-600"
              }`}
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
                  className="hidden md:flex items-center gap-3 px-4 py-2 rounded-sm bg-gray-100/60 hover:bg-gray-200/80 transition-all duration-200 border border-gray-200/50 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-[#0891b2] rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith('http') 
                            ? user.avatar 
                            : `/api/proxy-image?url=${encodeURIComponent(
                                `${API_CONFIG.UPLOADS_URL}/${user.avatar}`
                              )}`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
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
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-4 h-4 text-gray-600"
                  />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={closeUserMenu}
                    />
                    <div
                      className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-sm shadow-xl border border-gray-200/50 z-50 py-2"
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
                          <FontAwesomeIcon
                            icon={faTachometerAlt}
                            className="w-4 h-4"
                          />
                          Dashboard
                        </Link>
                        {user.userType === "CANDIDATE" && (
                          <Link
                            href="/userdashboard/profile"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors font-text"
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              className="w-4 h-4"
                            />
                            Profile
                          </Link>
                        )}
                        {user.userType === "COMPANY" && (
                          <Link
                            href="/dashboard/company-profile"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors font-text"
                          >
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="w-4 h-4"
                            />
                            Company Profile
                          </Link>
                        )}
                        <div className="border-t border-gray-200/60 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors w-full text-left font-text"
                          >
                            <FontAwesomeIcon
                              icon={faSignOutAlt}
                              className="w-4 h-4"
                            />
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
              <Link href="/login">
                <button className="hidden md:inline-flex items-center gap-2 rounded-sm shadow-lg px-5 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105">
                  Sign In
                </button>
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-gray-100/60 text-gray-700 hover:bg-gray-200/80 hover:text-primary-600 transition-all duration-300 md:hidden border border-gray-200/50 backdrop-blur-sm"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  className="h-5 w-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
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
                  aria-hidden="true"
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
                  href="/"
                  className={`font-text hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95 ${
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
                  className={`font-text hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95 ${
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
                  className={`font-text hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95 ${
                    isActivePage("/employers")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  For Employers
                </Link>
                <Link
                  href="/about"
                  className={`font-text hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95 ${
                    isActivePage("/about")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className={`font-text hover:bg-gray-50/80 transition-all duration-200 py-4 px-4 text-lg font-medium rounded-xl active:scale-95 ${
                    isActivePage("/contact")
                      ? "text-primary-600 bg-primary-50/80"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                  onClick={closeMenu}
                >
                  Contact
                </Link>
                <div className="pt-6 border-t border-gray-200/60 mt-4">
                  {user ? (
                    // Authenticated user mobile menu
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl">
                        <div className="w-10 h-10 bg-[#0891b2] rounded-full flex items-center justify-center text-white font-semibold">
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

                      <Link href={getDashboardLink()}>
                        <button
                          onClick={closeMenu}
                          className="w-full rounded-sm py-2.5 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all duration-200 shadow-sm"
                        >
                          Go to Dashboard
                        </button>
                      </Link>

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
                    <Link href="/login">
                      <button
                        onClick={closeMenu}
                        className="w-full rounded-sm py-3 text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Sign In
                      </button>
                    </Link>
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

