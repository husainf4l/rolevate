'use client';

import { useParams } from 'next/navigation';
import ChatInput from '@/components/chat/ChatInput';

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params.id as string;

  const handleSendMessage = (message: string) => {
    console.log('Message sent in chat', chatId, ':', message);
    // TODO: Handle message sending logic for specific chat
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded in chat', chatId, ':', file.name);
    // TODO: Handle file upload logic for specific chat
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chat ID: {chatId}</p>
          <p className="text-muted-foreground mt-2">Chat messages will appear here</p>
        </div>
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        placeholder="Type your message..."
        chatId={chatId}
        shouldNavigate={false}
      />
    </div>
  );
}