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
      {/* Main Layout Container */}
      <div className="h-screen w-full flex flex-col relative z-10">
        {/* Main Content Area - Reserve space for bottom controls */}
        <div className="flex-1 relative min-h-0 pb-24 md:pb-32">
          <TileLayout showVisualizer={showVisualizer} />
        </div>

        {/* Bottom Control Bar - Fixed at bottom */}
        <MotionBottom
          {...BOTTOM_VIEW_MOTION_PROPS}
          className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="relative px-3 md:px-8 pb-3 md:pb-8 pointer-events-auto">
            {/* Gradient fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none -z-10"></div>
            <AgentControlBar 
              showVisualizer={showVisualizer}
              onVisualizerToggle={() => setShowVisualizer(!showVisualizer)}
            />
          </div>
        </MotionBottom>
      </div>


    </section>
  );
}
