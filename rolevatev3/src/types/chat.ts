export interface ChatMessage {
  id?: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  sessionId?: string;
  error?: string;
}