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
            <Logo size={32} textColorLight="#ffffff" textColorAccent="#2DD4BF" />
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
            {authenticated && (
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              // Loading skeleton
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse hidden sm:block"></div>
              </div>
            ) : authenticated && user ? (
              // Authenticated user dropdown
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl px-4 py-2 transition-all duration-200 border border-gray-700/50 hover:border-teal-500/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link
                      href="/dashboard/cv"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My CV
                    </Link>

                    <div className="border-t border-gray-700/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Non-authenticated user buttons
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
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
              {authenticated && (
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {!authenticated && (
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
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
      
      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}
