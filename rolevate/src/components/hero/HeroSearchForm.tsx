'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeroSearchFormProps {
  messagePlaceholder: string;
  countries: string[];
  locale: string;
}

export default function HeroSearchForm({ messagePlaceholder, countries, locale }: HeroSearchFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [message, setMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, selectedCountry]);

  const handleSendClick = () => {
    // Add powerful Apple-style exit animation
    const heroSection = document.querySelector('section');
    const body = document.body;

    if (heroSection) {
      // Add blur and scale effect to entire page
      body.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      body.style.transform = 'scale(0.98)';
      body.style.filter = 'blur(1px)';

      // Hero section exit animation
      heroSection.style.transform = 'scale(0.92) translateY(-20px)';
      heroSection.style.opacity = '0';
      heroSection.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      heroSection.style.filter = 'blur(2px)';
    }

    // Navigate after animation completes
    setTimeout(() => {
      // Reset body styles before navigation
      body.style.transform = '';
      body.style.filter = '';
      body.style.transition = '';

      router.push(`/${locale}/chat`);
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-sm p-6 shadow-xl max-w-lg w-full">
      <div className="space-y-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={messagePlaceholder}
          className="w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 text-white placeholder-gray-300 transition-all duration-300 hover:bg-gray-600"
        />
        <div className="flex justify-between">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-32 px-4 py-3 rounded-sm bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-sm font-medium">{selectedCountry}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-32 bg-gray-800/95 backdrop-blur-sm rounded-sm shadow-xl z-10 overflow-hidden max-h-40 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700/80 transition-colors"
                    >
                      <span className="font-medium">{country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSendClick}
            className="px-4 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 relative z-10 ${locale === 'ar' ? 'scale-x-[-1]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            <div className="absolute inset-0 rounded-sm bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"></div>
          </button>
        </div>
      </div>
    </div>
  );
}