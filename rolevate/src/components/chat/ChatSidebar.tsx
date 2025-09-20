'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, MessageSquare, Menu, X, MoreHorizontal, Trash2, Edit3, Settings } from 'lucide-react';
import Logo from '@/components/common/logo';
import ThemeToggle from '@/components/common/theme-toggle';
import LocaleSwitcher from '@/components/common/localeSwitcher';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Job Interview Preparation',
      lastMessage: 'Can you help me prepare for a software engineer interview?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2', 
      title: 'Resume Review',
      lastMessage: 'Please review my resume for marketing positions',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '3',
      title: 'Career Change Advice',
      lastMessage: 'I want to transition from finance to tech',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ]);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const isCurrentChat = (chatId: string) => {
    return pathname.includes(`/chat/${chatId}`);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    setActiveDropdown(null);
  };

  const handleRenameChat = (chatId: string) => {
    // TODO: Implement rename functionality
    console.log('Rename chat:', chatId);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-muted/60 backdrop-blur-xl transform transition-transform duration-300 ease-in-out z-50 lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={handleLogoClick}
            className="hover:opacity-80 transition-opacity duration-200"
          >
            <Logo />
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 hover:bg-muted/50 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-primary/90 text-primary-foreground rounded-xl hover:bg-primary transition-all duration-200 text-sm font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {chatSessions.map((session) => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => handleChatSelect(session.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 relative ${
                    isCurrentChat(session.id)
                      ? 'bg-primary/10 shadow-sm'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare size={16} className="mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate leading-tight mb-1">{session.title}</h4>
                      <p className="text-xs text-muted-foreground/80 truncate leading-tight mb-2">
                        {session.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {formatTimestamp(session.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-3 top-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === session.id ? null : session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted/50 rounded-md transition-all duration-200"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {activeDropdown === session.id && (
                    <div className="absolute right-0 top-8 bg-card/95 backdrop-blur-xl rounded-xl shadow-lg py-2 min-w-[120px] z-10">
                      <button
                        onClick={() => handleRenameChat(session.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <Edit3 size={14} />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDeleteChat(session.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 space-y-4">
          {/* Settings Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LocaleSwitcher />
            </div>
            <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <Settings size={16} className="text-muted-foreground" />
            </button>
          </div>
          
          {/* Brand Text */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground/60 text-center">
              AI-powered recruitment
            </p>
          </div>
        </div>
      </div>
    </>
  );
}