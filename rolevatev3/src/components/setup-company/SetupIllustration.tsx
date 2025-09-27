"use client";

import React from "react";

export default function SetupIllustration() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Setup Illustration</h3>
      </div>
    </div>
  );
}