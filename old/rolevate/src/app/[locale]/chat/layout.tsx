'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <ChatSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-card/80 backdrop-blur-xl">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <Menu size={18} />
          </button>
          <h1 className="font-medium text-sm">Chat</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Chat Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}