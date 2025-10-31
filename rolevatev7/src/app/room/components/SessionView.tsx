'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TileLayout } from './TileLayout';
import { AgentControlBar } from './AgentControlBar';
import { AudioVisualizer3D } from '@/components/room/AudioVisualizer3D';

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
      <section className="relative z-10 h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-16 h-16 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Main Content - Full width */}
      <div className="h-screen w-full flex flex-col relative z-10">
        {/* Agent Video/Audio with integrated transcript */}
        <div className="flex-1 relative min-h-0 z-10">
          <TileLayout />
        </div>
      </div>

      {/* Audio Visualizer Overlay - Above content but below UI */}
      {showVisualizer && (
        <div className="absolute inset-0 z-20 opacity-70 pointer-events-none">
          <AudioVisualizer3D 
            isVisible={showVisualizer}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Visualizer Toggle Button */}
      <button
        onClick={() => setShowVisualizer(!showVisualizer)}
        className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-2 transition-all duration-200"
        title={showVisualizer ? 'Hide Audio Visualizer' : 'Show Audio Visualizer'}
      >
        <svg 
          className={`w-5 h-5 text-white transition-colors ${showVisualizer ? 'text-blue-400' : 'text-gray-400'}`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      </button>

      {/* Bottom Control Bar */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="relative px-3 md:px-8 pb-3 md:pb-8 pointer-events-auto">
          {/* Gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none -z-10"></div>
          <AgentControlBar />
        </div>
      </MotionBottom>
    </section>
  );
}
