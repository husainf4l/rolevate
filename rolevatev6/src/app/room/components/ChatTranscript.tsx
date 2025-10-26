'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import type { TranscriptionSegment } from 'livekit-client';

const MotionDiv = motion.div;

interface ChatTranscriptProps {
  className?: string;
}

export function ChatTranscript({ className = '' }: ChatTranscriptProps) {
  const room = useRoomContext();
  const { state: agentState } = useVoiceAssistant();
  const [currentText, setCurrentText] = useState<string>('');
  const [isFinal, setIsFinal] = useState<boolean>(false);

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
          console.log('📝 Agent transcript:', segment.text, 'Final:', segment.final);
          
          setCurrentText(segment.text.trim());
          setIsFinal(segment.final);
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

  return (
    <div className={className}>
      {/* Header - More compact on mobile */}
      <div className="flex items-center justify-between mb-2 md:mb-4 px-0.5">
        <h3 className="text-[11px] md:text-sm font-semibold text-white/90 tracking-wide">LIVE TRANSCRIPT</h3>
        {agentState === 'speaking' && (
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] md:text-xs text-white/60 uppercase tracking-wider">Speaking</span>
          </div>
        )}
      </div>

      {/* Current Paragraph Display - Optimized for mobile */}
      <div className="flex items-center justify-center min-h-[80px] md:min-h-[180px] lg:min-h-[220px]">
        {!currentText ? (
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
            <div className={`
              backdrop-blur-xl rounded-xl md:rounded-2xl lg:rounded-3xl 
              px-2.5 md:px-5 lg:px-6 py-2.5 md:py-4 lg:py-6 
              border transition-all duration-300
              ${isFinal 
                ? 'bg-white/5 border-white/10' 
                : 'bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-cyan-500/15 border-blue-400/25 shadow-lg shadow-blue-500/10'
              }
            `}>
              <div className="flex items-start gap-2 md:gap-3 lg:gap-4">
                {/* AI Avatar - Smaller on mobile */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-6 h-6 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
                    <span className="text-white text-[9px] md:text-xs lg:text-sm font-bold">AI</span>
                  </div>
                </div>
                
                {/* Text Content with smooth typing */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <motion.p 
                    key={currentText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/95 text-[13px] leading-[1.5] md:text-sm md:leading-relaxed lg:text-base xl:text-lg font-medium"
                  >
                    {currentText}
                    {!isFinal && agentState === 'speaking' && (
                      <motion.span 
                        className="inline-block ml-1 w-0.5 h-3 md:h-4 lg:h-5 bg-blue-400 rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.p>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
