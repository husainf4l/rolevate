'use client';

import { useState, useEffect } from 'react';
import TemplateSwitcher from './TemplateSwitcher';
import ProgressBar from './ProgressBar';
import { useProgressStream } from '@/hooks/useProgressStream';

interface CVPanelProps {
  template: string;
  progress: number;
  status: string;
  onTemplateChange: (template: string) => void;
  isGenerating?: boolean;
  pdfUrl?: string;
}

export default function CVPanel({ 
  template, 
  progress: externalProgress, 
  status: externalStatus, 
  onTemplateChange, 
  isGenerating = false,
  pdfUrl 
}: CVPanelProps) {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(pdfUrl || null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use WebSocket for real-time progress updates
  const { 
    status: wsStatus, 
    progress: wsProgress, 
    isConnected, 
    error: wsError,
    progressData,
    startProgress,
    stopProgress 
  } = useProgressStream();

  // Use WebSocket data if connected, otherwise use props
  const currentProgress = isConnected ? wsProgress : externalProgress;
  const currentStatus = isConnected ? wsStatus : externalStatus;

  // Handle PDF URL updates from WebSocket
  useEffect(() => {
    if (progressData?.pdfUrl) {
      setLocalPdfUrl(progressData.pdfUrl);
      setDownloadUrl(progressData.pdfUrl);
      setIsLoading(false);
    }
  }, [progressData]);

  // Start WebSocket connection when generation begins
  useEffect(() => {
    if (isGenerating && !isConnected) {
      startProgress();
      setIsLoading(true);
      setLocalPdfUrl(null);
      setDownloadUrl(null);
    } else if (!isGenerating && isConnected) {
      stopProgress();
      setIsLoading(false);
    }
  }, [isGenerating, isConnected, startProgress, stopProgress]);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${template.replace('_cv.html', '')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePreview = () => {
    if (localPdfUrl) {
      window.open(localPdfUrl, '_blank');
    }
  };

  const renderContent = () => {
    // Show error state
    if (wsError && isConnected) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generation Failed</h3>
            <p className="text-red-600 mb-4">{wsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Show completed state with PDF
    if (localPdfUrl && currentProgress >= 100) {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">CV Generated Successfully!</h3>
                  <p className="text-sm text-green-600">Your CV is ready for download or preview</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
          
          {/* PDF Preview */}
          <div className="flex-1 p-4">
            <iframe 
              src={localPdfUrl}
              className="w-full h-full border border-gray-300 rounded-lg shadow-sm"
              title="CV Preview"
            />
          </div>
        </div>
      );
    }

    // Show progress state
    if (isLoading || currentProgress > 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Generating Your CV</h3>
            <p className="text-gray-600">Please wait while we create your professional CV...</p>
          </div>

          <ProgressBar 
            progress={currentProgress} 
            status={currentStatus} 
            isActive={true}
          />

          {/* Connection status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600">
              {isConnected ? 'Connected to progress stream' : 'Connecting...'}
            </span>
          </div>
        </div>
      );
    }

    // Show ready state
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Ready to Generate CV</h3>
          <p className="text-gray-600 max-w-md">
            Start a conversation in the chat panel to generate your professional CV using the selected template.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Quick Tips</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Describe your work experience</li>
                <li>• List your key skills</li>
                <li>• Include education details</li>
                <li>• Mention achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-1/2 h-full flex flex-col bg-gray-50">
      <TemplateSwitcher 
        selectedTemplate={template} 
        onChange={onTemplateChange}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}