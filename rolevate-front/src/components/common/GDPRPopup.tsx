"use client";

import { useState, useEffect } from "react";

export default function GDPRPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const gdprAccepted = localStorage.getItem("gdpr-accepted");
    if (!gdprAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gdpr-accepted", "true");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("gdpr-accepted", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white border-t shadow-lg mx-4 mb-4 rounded-lg transform transition-all duration-300 ease-out">
        <div className="p-6 relative">
          <button
            onClick={handleReject}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-700 text-sm">
                We use cookies to improve your experience. By continuing to use our site, you accept our use of cookies.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}