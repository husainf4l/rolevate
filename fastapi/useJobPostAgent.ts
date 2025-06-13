// hooks/useJobPostAgent.ts
import { useState, useCallback } from 'react';
import { JobPostAPI, JobData, SessionInfo } from '@/lib/job-post-api';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseJobPostAgentOptions {
  companyId: string;
  companyName: string;
  apiBaseUrl?: string;
  onJobPostComplete?: (jobData: JobData) => void;
  onError?: (error: string) => void;
}

export function useJobPostAgent({
  companyId,
  companyName,
  apiBaseUrl = 'http://localhost:8000',
  onJobPostComplete,
  onError
}: UseJobPostAgentOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new JobPostAPI(apiBaseUrl);

  const addMessage = useCallback((type: 'user' | 'assistant', content: string) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const sendMessage = useCallback(async (message: string) => {
    if (isLoading || !message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    addMessage('user', message);

    try {
      let result;
      
      if (sessionId) {
        // Continue existing conversation
        result = await api.continueChat({
          message,
          sessionId,
          companyId,
          companyName
        });
      } else {
        // Start new conversation
        result = await api.createJobPost({
          message,
          companyId,
          companyName
        });
      }

      if (result.status === 'error') {
        throw new Error(result.error || 'Unknown error occurred');
      }

      // Update state
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
      setIsComplete(result.is_complete || false);
      
      // Add assistant response
      if (result.agent_response) {
        addMessage('assistant', result.agent_response);
      }

      // Handle completion
      if (result.is_complete && result.job_data && onJobPostComplete) {
        onJobPostComplete(result.job_data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, companyId, companyName, api, addMessage, handleError, onJobPostComplete]);

  const getSessionInfo = useCallback(async () => {
    if (!sessionId) return;

    try {
      const info = await api.getSessionInfo(sessionId);
      setSessionInfo(info);
      return info;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session info';
      handleError(errorMessage);
    }
  }, [sessionId, api, handleError]);

  const startNewSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setSessionInfo(null);
    setIsComplete(false);
    setError(null);
  }, []);

  const deleteSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await api.deleteSession(sessionId);
      startNewSession();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      handleError(errorMessage);
    }
  }, [sessionId, api, startNewSession, handleError]);

  const resumeSession = useCallback(async (existingSessionId: string) => {
    try {
      // Get session info to verify it exists and load data
      const info = await api.getSessionInfo(existingSessionId);
      
      setSessionId(existingSessionId);
      setSessionInfo(info);
      setIsComplete(info.is_complete);
      
      // You might want to reconstruct the conversation history here
      // if it's stored in the session info
      
      return info;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      handleError(errorMessage);
      throw err;
    }
  }, [api, handleError]);

  return {
    // State
    messages,
    isLoading,
    sessionId,
    sessionInfo,
    isComplete,
    error,
    
    // Actions
    sendMessage,
    getSessionInfo,
    startNewSession,
    deleteSession,
    resumeSession,
    
    // Utilities
    hasActiveSession: !!sessionId,
    canSendMessage: !isLoading && (!!sessionId || messages.length === 0),
  };
}
