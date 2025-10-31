'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import type { TranscriptionSegment } from 'livekit-client';

const MotionDiv = motion.div;

interface ChatTranscriptProps {
  className?: string;
}

// Detect if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Detect primary text direction
const detectTextDirection = (text: string): 'rtl' | 'ltr' => {
  if (!text) return 'ltr';
  
  // Count Arabic vs Latin characters
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  
  // If more than 30% Arabic characters, use RTL
  return arabicChars > latinChars * 0.3 ? 'rtl' : 'ltr';
};

export function ChatTranscript({ className = '' }: ChatTranscriptProps) {
  const room = useRoomContext();
  const { state: agentState } = useVoiceAssistant();
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState<string>('');
  const [isInterim, setIsInterim] = useState<boolean>(false);
  const lastFinalTextRef = useRef<string>('');

  // Check if this is CC mode (mobile or desktop) or mobile transcript
  const isMobileCC = className.includes('mobile-cc');
  const isDesktopCC = className.includes('desktop-cc');
  const isMobileTranscript = className.includes('mobile-transcript');
  const isCCMode = isMobileCC || isDesktopCC;

  // Detect text direction for current text
  const textDirection = useMemo(() => {
    const allText = transcriptLines.join(' ') + ' ' + currentParagraph;
    return detectTextDirection(allText);
  }, [transcriptLines, currentParagraph]);

  // Listen to transcription events from LiveKit
  useEffect(() => {
    if (!room) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: any,
      publication?: any
    ) => {
      segments.forEach((segment) => {
        const isAgent = participant?.isAgent || false;
        
        // Only show agent's speech
        if (isAgent && segment.text.trim()) {
          const trimmedText = segment.text.trim();
          
          if (segment.final) {
            // Final segment - add to transcript history (keep up to 5 lines)
            console.log('📝 Agent transcript (final):', trimmedText);
            
            // Check if this is a new paragraph (different from last final text)
            if (trimmedText !== lastFinalTextRef.current && trimmedText.length > 0) {
              // Add new line and keep only the last 5 lines
              setTranscriptLines(prev => {
                const updated = [...prev, trimmedText];
                return updated.slice(-5); // Keep only last 5 lines
              });
              
              lastFinalTextRef.current = trimmedText;
              setCurrentParagraph(''); // Clear current as it's now in history
              setIsInterim(false);
            }
          } else {
            // Interim segment - update current paragraph
            console.log('📝 Agent transcript (interim):', trimmedText);
            setCurrentParagraph(trimmedText);
            setIsInterim(true);
          }
        }
      });
    };

    // Subscribe to transcription events
    room.on('transcriptionReceived', handleTranscription);

    // Cleanup
    return () => {
      room.off('transcriptionReceived', handleTranscription);
    };
  }, [room]);

  const hasContent = transcriptLines.length > 0 || currentParagraph;

  // CC Mode - Clean captions only (both mobile and desktop)
  if (isCCMode) {
    return (
      <div className={`bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 ${
        isDesktopCC ? 'px-4 py-3' : 'px-3 py-2'
      }`}>
        {hasContent ? (
          <div 
            dir={textDirection}
            className={`text-white leading-5 ${
              isDesktopCC ? 'text-base' : 'text-sm'
            } ${textDirection === 'rtl' ? 'text-right' : 'text-left'}`}
            lang={textDirection === 'rtl' ? 'ar' : 'en'}
          >
            {/* Previous lines (faded) */}
            {transcriptLines.map((line, index) => (
              <p key={index} className="text-white/70 mb-1">
                {line}
              </p>
            ))}
            
            {/* Current line (active) */}
            {currentParagraph && (
              <p className="text-white/95">
                <span className={isInterim ? 'text-white/90' : 'text-white/95'}>
                  {currentParagraph}
                </span>
                {/* Typing cursor when speaking and interim */}
                {isInterim && agentState === 'speaking' && (
                  <motion.span 
                    className={`inline-block ${textDirection === 'rtl' ? 'mr-1' : 'ml-1'} w-0.5 ${
                      isDesktopCC ? 'h-4' : 'h-3'
                    } bg-[#0891b2] rounded-full`}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </p>
            )}
          </div>
        ) : (
          <p className={`text-white/40 text-center py-1 ${
            isDesktopCC ? 'text-base' : 'text-sm'
          }`}>Waiting for conversation...</p>
        )}
      </div>
    );
  }

  // Mobile Transcript Mode - Compact bottom section
  if (isMobileTranscript) {
    return (
      <div className={className}>
        {hasContent ? (
          <div className="backdrop-blur-xl rounded-xl px-4 py-3 border border-white/10 bg-white/5 max-h-20 overflow-hidden">
            <div 
              dir={textDirection}
              className={`text-white/95 text-sm leading-relaxed font-medium ${
                textDirection === 'rtl' ? 'text-right' : 'text-center'
              }`}
              lang={textDirection === 'rtl' ? 'ar' : 'en'}
            >
              {/* Show only the current/latest message */}
              {currentParagraph || transcriptLines[transcriptLines.length - 1]}
              {/* Typing cursor when speaking and interim */}
              {isInterim && agentState === 'speaking' && currentParagraph && (
                <motion.span 
                  className={`inline-block ${textDirection === 'rtl' ? 'mr-1' : 'ml-1'} w-0.5 h-4 bg-[#0891b2] rounded-full`}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-white/40 text-center text-sm py-2">
            Waiting for AI response...
          </div>
        )}
      </div>
    );
  }

  // Desktop Mode - Full layout with containers
  return (
    <div className={className}>
      {/* Current Paragraph Display - Optimized for mobile */}
      <div className="flex items-center justify-center min-h-[80px] md:min-h-[180px] lg:min-h-[220px]">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center gap-2 md:gap-3 text-white/30">
            <div className="w-8 md:w-12 h-8 md:h-12 rounded-full border-2 border-white/10 flex items-center justify-center">
              <svg className="w-4 md:w-6 h-4 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-[10px] md:text-sm text-center">Waiting for conversation...</p>
          </div>
        ) : (
          <MotionDiv
            key="transcript-content"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div className="backdrop-blur-xl rounded-xl md:rounded-2xl lg:rounded-3xl px-2.5 md:px-5 lg:px-6 py-2.5 md:py-4 lg:py-6 border border-white/10 bg-white/5">
              {/* Text Content - transcript history with bidirectional support */}
              <div className="w-full space-y-2">
                {/* Previous lines (faded) */}
                {transcriptLines.map((line, index) => (
                  <p 
                    key={index}
                    dir={textDirection}
                    className={`text-white/70 text-[13px] leading-[1.5] md:text-sm md:leading-relaxed lg:text-base xl:text-lg font-medium ${
                      textDirection === 'rtl' ? 'text-right' : 'text-left'
                    }`}
                    lang={textDirection === 'rtl' ? 'ar' : 'en'}
                  >
                    {line}
                  </p>
                ))}
                
                {/* Current paragraph (active) */}
                {currentParagraph && (
                  <p 
                    dir={textDirection}
                    className={`text-white/95 text-[13px] leading-[1.5] md:text-sm md:leading-relaxed lg:text-base xl:text-lg font-medium ${
                      textDirection === 'rtl' ? 'text-right' : 'text-left'
                    }`}
                    lang={textDirection === 'rtl' ? 'ar' : 'en'}
                  >
                    <span className={isInterim ? 'text-white/90' : 'text-white/95'}>
                      {currentParagraph}
                    </span>
                    {/* Typing cursor when speaking and interim */}
                    {isInterim && agentState === 'speaking' && (
                      <motion.span 
                        className={`inline-block ${textDirection === 'rtl' ? 'mr-1' : 'ml-1'} w-0.5 h-3 md:h-4 lg:h-5 bg-[#0891b2] rounded-full`}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </p>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
