/**
 * Real-time Progress Bar Component for CV Processing
 * Connects to WebSocket for live progress updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Upload, FileText, Wand2, Download, Cloud } from 'lucide-react';

const STAGE_ICONS = {
  initialized: Loader2,
  uploading: Upload,
  extracting: FileText,
  deduplicating: Wand2,
  formatting: Wand2,
  template_selection: FileText,
  rendering: Wand2,
  generating_pdf: FileText,
  uploading_cloud: Cloud,
  completed: CheckCircle2,
  error: AlertCircle
};

const STAGE_LABELS = {
  initialized: 'Initializing...',
  uploading: 'Uploading file...',
  extracting: 'Extracting CV data...',
  deduplicating: 'Removing duplicates...',
  formatting: 'Formatting content...',
  template_selection: 'Selecting template...',
  rendering: 'Rendering CV...',
  generating_pdf: 'Generating PDF...',
  uploading_cloud: 'Uploading to cloud...',
  completed: 'Completed!',
  error: 'Error occurred'
};

export const ProgressBar = ({
  jobId,
  onComplete,
  onError,
  className = ''
}) => {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      // Connect to WebSocket endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/progress/${jobId}`;
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log(`Connected to progress stream for job: ${jobId}`);
        setIsConnected(true);
        setError(null);
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'progress_update':
              setProgress(message.data);
              break;
              
            case 'job_completed':
              setProgress(message.data.result);
              if (onComplete) {
                onComplete(message.data.result);
              }
              break;
              
            case 'job_error':
              setError(message.data.error);
              if (onError) {
                onError(message.data.error);
              }
              break;
              
            case 'initial_status':
              if (message.data) {
                setProgress(message.data);
              }
              break;
              
            case 'keepalive':
              // Send pong
              websocket.send(JSON.stringify({ type: 'pong' }));
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsConnected(false);
      };
      
      websocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds if not completed
        if (progress?.stage !== 'completed' && progress?.stage !== 'error') {
          setTimeout(() => {
            if (!ws || ws.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
      
      setWs(websocket);
      
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect to progress stream');
    }
  }, [jobId, onComplete, onError, progress?.stage, ws]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Send keepalive pings
  useEffect(() => {
    if (!ws || !isConnected) return;
    
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [ws, isConnected]);

  const getStageIcon = (stage) => {
    const Icon = STAGE_ICONS[stage] || Loader2;
    return <Icon className={`w-5 h-5 ${stage === 'completed' ? 'text-green-500' : stage === 'error' ? 'text-red-500' : 'text-blue-500 animate-spin'}`} />;
  };

  const getStageLabel = (stage) => {
    return STAGE_LABELS[stage] || 'Processing...';
  };

  const getProgressColor = (stage, percentage) => {
    if (stage === 'completed') return 'bg-green-500';
    if (stage === 'error') return 'bg-red-500';
    return 'bg-blue-500';
  };

  if (!progress && !error) {
    return (
      <div className={`flex items-center space-x-3 p-4 bg-gray-50 rounded-lg ${className}`}>
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        <span className="text-gray-600">Connecting to progress stream...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">Processing Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={connectWebSocket}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const percentage = progress?.percentage || 0;
  const stage = progress?.stage || 'initialized';
  const message = progress?.message || 'Processing...';

  return (
    <div className={`space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Processing CV</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Connecting...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStageIcon(stage)}
            <span className="text-sm font-medium text-gray-700">
              {getStageLabel(stage)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {percentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(stage, percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      
      {/* Metadata */}
      {progress?.metadata && Object.keys(progress.metadata).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-2">Processing Details:</p>
          <div className="space-y-1">
            {progress.metadata.template_used && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Template:</span>
                <span className="text-gray-700 font-mono">{progress.metadata.template_used}</span>
              </div>
            )}
            {progress.metadata.experiences_count && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Experiences:</span>
                <span className="text-gray-700">{progress.metadata.experiences_count}</span>
              </div>
            )}
            {progress.metadata.skills_count && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Skills:</span>
                <span className="text-gray-700">{progress.metadata.skills_count}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Completion Actions */}
      {stage === 'completed' && progress?.metadata?.result && (
        <div className="mt-4 flex space-x-3">
          {progress.metadata.result.pdf_path && (
            <a
              href={progress.metadata.result.pdf_path}
              download
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CV</span>
            </a>
          )}
          {progress.metadata.result.cloud_url && (
            <a
              href={progress.metadata.result.cloud_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Cloud className="w-4 h-4" />
              <span>View Online</span>
            </a>
          )}
        </div>
      )}
      
      {/* Timestamp */}
      {progress?.timestamp && (
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {new Date(progress.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default ProgressBar;