import { UserData } from '@/types/auth';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: UserData;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  participants: UserData[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  jobId?: string; // If conversation is about a specific job
  jobTitle?: string;
}

export interface CreateMessageDto {
  conversationId?: string;
  recipientId?: string; // For new conversations
  content: string;
  messageType?: Message['messageType'];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CreateConversationDto {
  recipientId: string;
  jobId?: string;
  initialMessage: string;
}

export interface MessagesResponse {
  success: boolean;
  conversations?: Conversation[];
  conversation?: Conversation;
  messages?: Message[];
  messageData?: Message;
  message?: string;
}

class MessagesService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async getConversations(): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/conversations`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          conversations: Array.isArray(result) ? result : result.conversations || [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch conversations',
        };
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        message: 'Network error while fetching conversations',
      };
    }
  }

  async getConversation(conversationId: string): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/conversations/${conversationId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          conversation: result.conversation,
          messages: result.messages || [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch conversation',
        };
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        message: 'Network error while fetching conversation',
      };
    }
  }

  async createConversation(data: CreateConversationDto): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          conversation: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to create conversation',
        };
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        message: 'Network error while creating conversation',
      };
    }
  }

  async sendMessage(data: CreateMessageDto): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageData: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to send message',
        };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Network error while sending message',
      };
    }
  }

  async markAsRead(conversationId: string): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to mark messages as read',
        };
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        message: 'Network error while marking messages as read',
      };
    }
  }

  async markMessageAsRead(messageId: string): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to mark message as read',
        };
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      return {
        success: false,
        message: 'Network error while marking message as read',
      };
    }
  }

  async deleteMessage(messageId: string): Promise<MessagesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        const result = await response.json();
        return {
          success: false,
          message: result.message || result.error || 'Failed to delete message',
        };
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      return {
        success: false,
        message: 'Network error while deleting message',
      };
    }
  }

  async getUnreadCount(): Promise<{ success: boolean; count?: number; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/unread-count`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          count: result.count || 0,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to get unread count',
        };
      }
    } catch (error) {
      console.error('Error getting unread count:', error);
      return {
        success: false,
        message: 'Network error while getting unread count',
      };
    }
  }

  async uploadFile(file: File): Promise<{ success: boolean; fileUrl?: string; fileName?: string; fileSize?: number; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/messages/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to upload file',
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: 'Network error while uploading file',
      };
    }
  }
}

export const messagesService = new MessagesService();