'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const MaintenancePage: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-10-29T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12 animate-pulse">
          <div className="relative w-32 h-32 drop-shadow-2xl">
            <Image
              src="/logo/Rolevate-icon.webp"
              alt="Rolevate"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
              We&apos;re Building
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Something Amazing
            </h2>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-xl mx-auto">
            Our site is currently under maintenance. We&apos;ll be back soon with an incredible experience.
          </p>

          {/* Countdown Timer */}
          <div className="mt-12">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-6 font-semibold">
              Back in
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
              {[
                { label: 'Days', value: timeRemaining.days },
                { label: 'Hours', value: timeRemaining.hours },
                { label: 'Minutes', value: timeRemaining.minutes },
                { label: 'Seconds', value: timeRemaining.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl p-6 shadow-lg backdrop-blur-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-medium">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Need immediate assistance?{' '}
              <a
                href="mailto:support@rolevate.com"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
