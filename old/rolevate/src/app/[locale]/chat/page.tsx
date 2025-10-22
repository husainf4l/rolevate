'use client';

import ChatInput from '@/components/chat/ChatInput';

export default function ChatPage() {
  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    // TODO: Handle message sending logic
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // TODO: Handle file upload logic
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chat messages will appear here</p>
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        placeholder="Type your message..."
        shouldNavigate={true}
      />
    </div>
  );
}
