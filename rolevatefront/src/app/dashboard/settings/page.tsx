"use client";

import { Settings, Clock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/30 backdrop-blur-lg p-6 rounded-full border border-slate-700/50">
            <Settings className="h-16 w-16 text-[#00C6AD]" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
          Settings
        </h1>
        
        <div className="flex items-center justify-center mb-6">
          <Clock className="h-5 w-5 text-slate-400 mr-2" />
          <p className="text-xl text-slate-300">
            Coming Soon
          </p>
        </div>
        
        <p className="text-slate-400 max-w-md mx-auto">
          We're working on bringing you comprehensive settings to customize your Rolevate experience.
        </p>
      </div>
    </div>
  );
}