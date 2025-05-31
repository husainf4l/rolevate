'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/logo/logo'

// Navigation item component
interface NavItemProps {
  href: string;
  text: string;
  icon: React.ReactNode;
  badge?: string;
}

const NavItem = ({ href, text, icon, badge }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-xl group transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-gradient-to-r from-teal-500/10 to-teal-600/10 text-teal-400 shadow-lg shadow-teal-500/10' 
          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r-full" />
      )}
      <div className={`mr-4 transition-all duration-200 ${isActive ? 'text-teal-400 scale-110' : 'text-gray-400 group-hover:text-white group-hover:scale-105'}`}>
        {icon}
      </div>
      <span className="flex-1">{text}</span>
      {badge && (
        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-teal-500/20 text-teal-400 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

type Props = {}

const Sidebar = (props: Props) => {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-700/30">
            <Logo/>
          </div>
          
          {/* Navigation Section */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                <NavItem 
                  href="/dashboard" 
                  text="Dashboard"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v4M16 5v4" />
                    </svg>
                  }
                />
                
                <NavItem 
                  href="/dashboard/jobpost" 
                  text="Job Post"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                
                <NavItem 
                  href="/dashboard/cv" 
                  text="CV Manager"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                
                <NavItem 
                  href="/dashboard/profile" 
                  text="Profile"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </div>
              
              {/* Divider with label */}
              <div className="pt-6 pb-2">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-700/50"></div>
                  <span className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</span>
                  <div className="flex-1 border-t border-gray-700/50"></div>
                </div>
              </div>
              
              {/* Account Section */}
              <div className="space-y-1">
                <NavItem 
                  href="/dashboard/settings" 
                  text="Settings"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                
                <NavItem 
                  href="/dashboard/help" 
                  text="Help & Support"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </nav>
          </div>
          
          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-700/30">
            {/* Sign Out Button */}
            <button 
              onClick={() => console.log('Sign out clicked')} 
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 group transition-all duration-200"
            >
              <svg className="mr-4 h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
            
            {/* User Info */}
            <div className="mt-4 p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">RU</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Rolevate User</p>
                  <p className="text-xs text-gray-400 truncate">Premium Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar