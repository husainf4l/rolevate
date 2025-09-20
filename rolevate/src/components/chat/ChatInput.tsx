'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Paperclip, Plus, Image, X, FileText } from 'lucide-react';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  chatId?: string;
  shouldNavigate?: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  onFileUpload,
  disabled = false, 
  placeholder = "Type a message...",
  chatId,
  shouldNavigate = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage?.(message.trim());
      
      // Navigate to chat with ID if specified
      if (shouldNavigate && chatId) {
        router.push(`/chat/${chatId}`);
      } else if (shouldNavigate && !chatId) {
        // Generate a new chat ID if not provided
        const newChatId = generateChatId();
        router.push(`/chat/${newChatId}`);
      }
      
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const generateChatId = () => {
    // Generate a simple UUID-like ID for new chats
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      setShowAttachMenu(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
    setShowAttachMenu(false);
  };

  const openCVDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.rtf';
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const openImageDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachMenu) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  return (
    <div className="w-full bg-background pt-4 pb-6">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative flex items-center bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.rtf,image/*,video/*,audio/*"
            onChange={handleFileSelect}
          />

          {/* Plugin/Add Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="flex-shrink-0 p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-2xl transition-all duration-200 flex items-center justify-center"
              disabled={disabled}
            >
              {showAttachMenu ? <X size={20} /> : <Plus size={20} />}
            </button>

            {/* Attachment Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-card rounded-lg shadow-lg p-3 min-w-[200px] w-max">
                <button
                  onClick={openCVDialog}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <FileText size={16} />
                  Upload CV/Resume
                </button>
                <button
                  onClick={openFileDialog}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Paperclip size={16} />
                  Attach Document
                </button>
                <button
                  onClick={openImageDialog}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Image size={16} />
                  Upload Image
                </button>
              </div>
            )}
          </div>

          {/* Textarea Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none bg-transparent py-4 px-2 pr-12 text-foreground placeholder-muted-foreground focus:outline-none text-base min-h-[56px] max-h-48"
              style={{
                resize: 'none',
                overflow: 'auto',
                lineHeight: '1.5',
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                message.trim() && !disabled
                  ? 'text-primary hover:bg-primary/10 hover:scale-105'
                  : 'text-muted-foreground opacity-50 cursor-not-allowed'
              }`}
            >
              {disabled ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
        
     

        {/* Disclaimer */}
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground opacity-70">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}