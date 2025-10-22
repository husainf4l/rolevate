'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './localeSwitcher';
import ThemeToggle from './theme-toggle';
import Logo from './logo';
import { useAuth } from '@/contexts/auth-context';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const t = useTranslations('navbar');
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.userType === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard';
  };

  const getUserInitials = () => {
    if (!user) return '';
    return (user.firstName?.[0] || user.email[0]).toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here - could navigate to search results page
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
      scrolled
        ? 'bg-background/90 backdrop-blur-xl shadow-sm'
        : 'bg-background/60 backdrop-blur-md'
    }`}>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4 xl:space-x-6">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Menu - Near Logo */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center space-x-4 xl:space-x-6">
                <Link
                  href="/"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  {t('home')}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
                <Link
                  href="/jobs"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  {t('jobs')}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
                <Link
                  href="/chat"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  AI Chat
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
                <Link
                  href="/employers"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  {t('employers')}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
                <Link
                  href="/about"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  {t('about')}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
                <Link
                  href="/contact"
                  className="relative text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium group py-1"
                >
                  {t('contact')}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Search Bar - Near Theme Switcher */}
            <div className="hidden lg:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <div className={`relative flex items-center transition-all duration-300 ease-out ${
                  searchFocused
                    ? 'w-72 xl:w-80'
                    : 'w-56 xl:w-64'
                }`}>
                  <svg
                    className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full h-8 pl-10 pr-8 text-sm bg-muted/50 rounded-full
                      placeholder-muted-foreground text-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background
                      hover:bg-muted/70
                      transition-all duration-200 ease-out
                      dark:bg-muted/30 dark:hover:bg-muted/50 dark:focus:bg-background/80"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-0.5 rounded-full hover:bg-muted transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>

            {/* Profile/Login Button */}
            {isLoading ? (
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10">
                <div className="w-3 h-3 border border-foreground/30 border-t-foreground/60 rounded-full animate-spin"></div>
              </div>
            ) : user ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary hover:bg-primary/80 transition-all duration-200 hover:scale-105 text-primary-foreground font-medium text-sm"
                  aria-label="Profile menu"
                >
                  {getUserInitials()}
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-200 flex items-center justify-center active:scale-95 border border-primary/20 shadow-sm"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 relative flex flex-col justify-center">
                <span className={`block absolute h-0.5 w-6 bg-primary transform transition-all duration-300 ${isOpen ? 'rotate-45' : '-translate-y-2'}`}></span>
                <span className={`block absolute h-0.5 w-6 bg-primary transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block absolute h-0.5 w-6 bg-primary transform transition-all duration-300 ${isOpen ? '-rotate-45' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-1 mt-2 border-t border-foreground/10">
            {/* Mobile Search Bar */}
            <div className="px-3 pb-3">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-10 pr-8 text-sm bg-muted/50 rounded-full
                      placeholder-muted-foreground text-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background
                      hover:bg-muted/70
                      transition-all duration-200 ease-out
                      dark:bg-muted/30 dark:hover:bg-muted/50 dark:focus:bg-background/80"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-0.5 rounded-full hover:bg-muted transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>
            <Link
              href="/"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              href="/jobs"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              {t('jobs')}
            </Link>
            <Link
              href="/chat"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              AI Chat
            </Link>
            <Link
              href="/employers"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              {t('employers')}
            </Link>
            <Link
              href="/about"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              {t('about')}
            </Link>
            <Link
              href="/contact"
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium py-3 px-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              {t('contact')}
            </Link>

            {/* Mobile Controls */}
            <div className="pt-3 mt-3 border-t border-foreground/10">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center space-x-3">
                  <div className="sm:hidden">
                    <ThemeToggle />
                  </div>
                  <div className="sm:hidden">
                    <LocaleSwitcher />
                  </div>
                </div>

                {/* Mobile Profile/Login */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-medium text-sm"
                      aria-label="Profile menu"
                    >
                      {getUserInitials()}
                    </button>

                    {/* Mobile Profile Dropdown */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-background rounded-lg shadow-lg py-1 z-50">
                        <div className="px-4 py-2">
                          <p className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href={getDashboardLink()}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsOpen(false);
                          }}
                        >
                          Dashboard
                        </Link>

                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsOpen(false);
                          }}
                        >
                          Profile Settings
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-foreground text-background transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setIsOpen(false)}
                    aria-label="Login"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;