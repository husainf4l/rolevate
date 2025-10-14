'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface ProgressData {
  status: string;
  progress: number;
  stage?: string;
  message?: string;
  error?: string;
  taskId?: string;
  pdfUrl?: string;
}

export interface UseProgressStreamReturn {
  status: string;
  progress: number;
  isConnected: boolean;
  error: string | null;
  progressData: ProgressData | null;
  startProgress: (taskId?: string) => void;
  stopProgress: () => void;
  reconnect: () => void;
}

export function useProgressStream(autoConnect = false): UseProgressStreamReturn {
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback((taskId?: string) => {
    cleanup();
    
    try {
      // Use localhost for development, adjust URL as needed
      const wsUrl = `ws://localhost:8000/ws/progress${taskId ? `?task_id=${taskId}` : ''}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to progress stream');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: ProgressData = JSON.parse(event.data);
          
          setProgressData(data);
          setStatus(data.status || 'Processing');
          setProgress(data.progress || 0);
          
          // Log progress for debugging
          console.log('Progress update:', data);
          
          if (data.error) {
            setError(data.error);
          }
        } catch (parseError) {
          console.error('Failed to parse progress message:', parseError);
          setError('Failed to parse progress data');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Auto-reconnect if not a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect(taskId);
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to connect after multiple attempts');
        }
      };

    } catch (connectionError) {
      console.error('Failed to create WebSocket connection:', connectionError);
      setError('Failed to create connection');
      setIsConnected(false);
    }
  }, [cleanup]);

  const startProgress = useCallback((taskId?: string) => {
    setStatus('Connecting...');
    setProgress(0);
    setError(null);
    setProgressData(null);
    connect(taskId);
  }, [connect]);

  const stopProgress = useCallback(() => {
    setStatus('Idle');
    setProgress(0);
    setError(null);
    setProgressData(null);
    cleanup();
  }, [cleanup]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Auto-connect on mount if requested
  useEffect(() => {
    if (autoConnect) {
      startProgress();
    }

    // Cleanup on unmount
    return cleanup;
  }, [autoConnect, startProgress, cleanup]);

  // Handle page visibility changes (pause/resume when tab is hidden/visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && wsRef.current) {
        console.log('Page hidden, maintaining WebSocket connection');
      } else if (!document.hidden && !isConnected && progressData) {
        console.log('Page visible, checking WebSocket connection');
        // Optionally reconnect if we lost connection while hidden
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, progressData]);

  return {
    status,
    progress,
    isConnected,
    error,
    progressData,
    startProgress,
    stopProgress,
    reconnect
  };
}