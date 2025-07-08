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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/20 shadow-sm">
        <div className="container mx-auto flex h-18 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={40} />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link
              href="/features"
              className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/corporate"
              className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200"
            >
              Corporate
            </Link>
            <Link
              href="/about"
              className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button 
              variant="primary" 
              size="sm" 
              href="/login"
              className="hidden md:inline-flex"
            >
              Sign In
            </Button>
            <button 
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:text-[#0891b2] transition-all duration-200 md:hidden"
            >
              {isMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-18 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/20 shadow-corporate md:hidden">
            <nav className="container mx-auto px-6 py-8">
              <div className="flex flex-col gap-6">
                <Link
                  href="/features"
                  className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200 py-3 text-lg font-medium"
                  onClick={closeMenu}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200 py-3 text-lg font-medium"
                  onClick={closeMenu}
                >
                  Pricing
                </Link>
                <Link
                  href="/corporate"
                  className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200 py-3 text-lg font-medium"
                  onClick={closeMenu}
                >
                  Corporate
                </Link>
                <Link
                  href="/about"
                  className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200 py-3 text-lg font-medium"
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="font-text text-gray-700 hover:text-[#0891b2] transition-colors duration-200 py-3 text-lg font-medium"
                  onClick={closeMenu}
                >
                  Contact
                </Link>
                <div className="pt-6 border-t border-gray-200/50">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    href="/login"
                    fullWidth
                    onClick={closeMenu}
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
