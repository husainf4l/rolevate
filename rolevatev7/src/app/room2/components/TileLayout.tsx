'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { ChatTranscript } from './ChatTranscript';
import { SpaceStarVisualizer3D } from './SpaceStarVisualizer3D';

const MotionContainer = motion.div;

const ANIMATION_TRANSITION = {
  type: 'spring' as const,
  stiffness: 675,
  damping: 75,
  mass: 1,
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  showVisualizer?: boolean;
}

export function TileLayout({ showVisualizer = true }: TileLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;

  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-slate-300 border-t-[#0891b2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col lg:flex-row relative overflow-hidden">
      {/* AI Agent Area - Mobile: Full screen, Desktop: Left 65% */}
      <div className="flex-1 lg:w-[65%] relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Mobile: Vertical centered layout */}
        <div className="lg:hidden h-full flex flex-col items-center justify-start p-4 space-y-6">
          {/* 1. User Video - Top right positioned */}
          <div className="w-full flex justify-end">
            <div className="w-24 h-32 md:w-28 md:h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
              <AnimatePresence>
                {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) ? (
                  <VideoTrack
                    trackRef={cameraTrack || screenShareTrack}
                    width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                    height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 2. Animation - Center */}
          <div className="flex-shrink-0 w-full flex justify-center">
            {/* Smaller 2025 Ultra-4K Teal Star for Mobile */}
            {showVisualizer && !isAvatar && (
              <div className="w-full max-w-sm h-48">
                <SpaceStarVisualizer3D 
                  isVisible={showVisualizer}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Avatar for Mobile */}
            {isAvatar && (
              <div className="w-full max-w-md aspect-video">
                <VideoTrack
                  width={videoWidth}
                  height={videoHeight}
                  trackRef={agentVideoTrack}
                  className="w-full h-full object-cover rounded-2xl border border-white/20 shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* 3. Thinking Status - Center */}
          <div className="flex-shrink-0">
            <p className="text-white/80 text-sm font-medium text-center">
              {agentState === 'speaking' ? 'AI Speaking' : 
               agentState === 'listening' ? 'AI Listening' : 
               agentState === 'thinking' ? 'AI Thinking' : 
               'AI Standby'}
            </p>
          </div>
        </div>

        {/* Desktop: AI Agent Area with 3D visualizer */}
        <div className="hidden lg:flex h-full flex-col items-center justify-center p-6 space-y-6">
          <AnimatePresence mode="wait">
            {!isAvatar && (
              // Audio Agent with 3D Visualizer
              <React.Fragment>
                {/* 🌟 2025 Ultra-4K Teal Star Visualizer */}
                {showVisualizer && (
                  <MotionContainer
                    key="visualizer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={ANIMATION_TRANSITION}
                    className="w-full max-w-4xl h-[500px] flex-shrink-0"
                  >
                    <SpaceStarVisualizer3D 
                      isVisible={showVisualizer}
                      className="w-full h-full"
                    />
                  </MotionContainer>
                )}

                {/* AI Activity Status - Under the Teal Planet */}
                <div className="flex-shrink-0">
                  <p className="text-white/80 text-sm font-medium text-center">
                    {agentState === 'speaking' ? 'AI Speaking' : 
                     agentState === 'listening' ? 'AI Listening' : 
                     agentState === 'thinking' ? 'AI Thinking' : 
                     'AI Standby'}
                  </p>
                </div>

                {/* Desktop Transcript - Under the thinking status */}
                <div className="flex-shrink-0 w-full max-w-4xl px-6">
                  <ChatTranscript className="desktop-transcript" />
                </div>
              </React.Fragment>
            )}

            {isAvatar && (
              // Avatar Agent Video
              <MotionContainer
                key="agent-avatar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={ANIMATION_TRANSITION}
                className="w-full max-w-xl aspect-video flex-shrink-0"
              >
                <VideoTrack
                  width={videoWidth}
                  height={videoHeight}
                  trackRef={agentVideoTrack}
                  className="w-full h-full object-cover rounded-xl border border-white/20 shadow-xl"
                />
              </MotionContainer>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* User Video Area - Desktop: Right 35% */}
      <div className="hidden lg:block lg:w-[35%] relative bg-gradient-to-bl from-slate-900 via-slate-800 to-slate-900 border-l border-white/10">
        <AnimatePresence>
          {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) ? (
            // User Video
            <MotionContainer
              key="user-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <VideoTrack
                trackRef={cameraTrack || screenShareTrack}
                width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay for text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* User Video Label - Only for Screen Share */}
              {screenShareTrack && isScreenShareEnabled && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <p className="text-white/90 text-sm font-medium">
                      📱 Screen Share
                    </p>
                  </div>
                </div>
              )}
            </MotionContainer>
          ) : (
            // Camera Off State
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-white/40 text-base">Camera is off</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
