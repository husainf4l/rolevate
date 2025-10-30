"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface UserData {
  name?: string;
  avatar?: string | undefined;
}

interface UserProfileSectionProps {
  userData: UserData;
  onLogout: () => void;
}

export default function UserProfileSection({ userData, onLogout }: UserProfileSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <div className="border-t border-gray-200 p-2 relative">
      {/* User Profile - Clickable to open menu */}
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          className="w-full flex flex-col items-center px-2 py-3 rounded-lg hover:bg-primary-50 transition-all duration-200 group"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="User menu"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow relative">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            {/* Activity indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-xs text-gray-700 mt-2 font-medium truncate max-w-[80px] group-hover:text-primary-600 transition-colors">
            {userData.name ? userData.name.split(" ")[0] : "User"}
          </span>
        </button>

        {/* Dropdown Menu - Fixed positioning to stay within sidebar */}
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 mb-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userData.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">Candidate</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Profile Link */}
              <Link
                href="/userdashboard/profile"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group/item"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4 text-gray-400 group-hover/item:text-primary-600 transition-colors" />
                <span className="group-hover/item:text-primary-600 transition-colors">My Profile</span>
              </Link>

              {/* Settings Link */}
              <Link
                href="/userdashboard/profile"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group/item"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cog6ToothIcon className="h-4 w-4 text-gray-400 group-hover/item:text-primary-600 transition-colors" />
                <span className="group-hover/item:text-primary-600 transition-colors">Settings</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100"></div>

            {/* Logout */}
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group/logout"
              onClick={handleLogoutClick}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover/logout:text-red-700 transition-colors" />
              <span className="group-hover/logout:text-red-700 transition-colors font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
