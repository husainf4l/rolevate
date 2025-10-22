"use client";

import React from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface UserData {
  name?: string;
  avatar?: string | undefined;
}

interface UserProfileSectionProps {
  userData: UserData;
  onLogout: () => void;
}

export default function UserProfileSection({ userData, onLogout }: UserProfileSectionProps) {
  return (
    <div className="border-t border-gray-200 p-2">
      {/* User Profile */}
      <div className="flex flex-col items-center px-2 py-3 text-xs mb-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mb-2">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-gray-900 truncate max-w-full">
            {userData.name || "Loading..."}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        className="w-full flex flex-col items-center px-2 py-3 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        onClick={onLogout}
        title="Logout"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 mb-1" />
        <span>Logout</span>
      </button>
    </div>
  );
}
