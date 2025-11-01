'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TileLayout } from './TileLayout';
import { AgentControlBar } from './AgentControlBar';
import { ChatTranscript } from './ChatTranscript';


const MotionBottom = motion.div;

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden' as const,
  animate: 'visible' as const,
  exit: 'hidden' as const,
  transition: {
    duration: 0.4,
    delay: 0.3,
    ease: [0.32, 0.72, 0, 1] as const, // Apple-style easing
  },
};

export function SessionView() {
  const [isMounted, setIsMounted] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none">
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-16 h-16 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none relative">
      {/* Main Content Area - Account for fixed controller */}
      <div className="h-full w-full pb-24 lg:pb-20">
        <div className="h-full flex flex-col">
          {/* TileLayout Content */}
          <div className="flex-1 relative min-h-0">
            <TileLayout showVisualizer={showVisualizer} />
          </div>

          {/* Transcript Section - Mobile Only, positioned above fixed controller */}
          <div className="lg:hidden flex-shrink-0 px-4 md:px-6 pb-4">
            <div className="w-full max-w-md mx-auto">
              <ChatTranscript className="mobile-transcript text-center" />
            </div>
          </div>
        </div>
      </div>

      {/* Controller Section - Fixed at bottom of screen */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-6 pb-6 md:pb-8 pt-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent"
      >
        <div className="w-full flex justify-center">
          <AgentControlBar 
            showVisualizer={showVisualizer}
            onVisualizerToggle={() => setShowVisualizer(!showVisualizer)}
          />
        </div>
      </MotionBottom>
    </section>
  );
}
