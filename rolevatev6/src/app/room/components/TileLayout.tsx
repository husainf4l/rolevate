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

export function TileLayout() {
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
    <div className="h-full w-full relative">
      {/* Full-Screen User Video Background */}
      <AnimatePresence>
        {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
          <MotionContainer
            key="user-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0"
          >
            <VideoTrack
              trackRef={cameraTrack || screenShareTrack}
              width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
              height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for better contrast with overlaid elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
          </MotionContainer>
        )}
      </AnimatePresence>

      {/* Fallback when camera is off */}
      {!isCameraEnabled && !isScreenShareEnabled && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm md:text-base">Camera is off</p>
          </div>
        </div>
      )}

      {/* Overlaid Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end p-4 md:p-6 pb-24 md:pb-28">
        {/* Main Agent Display */}
        <AnimatePresence mode="wait">
          {!isAvatar && (
            // Audio Agent - Bars with transcript overlaid on video
            <MotionContainer
              key="agent-audio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={ANIMATION_TRANSITION}
              className="flex flex-col items-center justify-end w-full max-w-2xl gap-4 md:gap-6"
            >
              {/* Audio Visualization */}
              <div className="w-full">
                <BarVisualizer
                  barCount={5}
                  state={agentState}
                  options={{ minHeight: 6 }}
                  trackRef={agentAudioTrack}
                  className={cn('flex h-16 md:h-24 items-center justify-center gap-1.5 md:gap-2')}
                >
                  <span
                    className={cn([
                      'bg-white/20 min-h-2.5 w-2.5 md:min-h-3 md:w-3 rounded-full',
                      'origin-center transition-all duration-200 ease-out',
                      'data-[lk-highlighted=true]:bg-gradient-to-t data-[lk-highlighted=true]:from-blue-400 data-[lk-highlighted=true]:to-cyan-300 data-[lk-highlighted=true]:shadow-lg data-[lk-highlighted=true]:shadow-blue-500/50',
                      'data-[lk-muted=true]:bg-white/10',
                    ])}
                  />
                </BarVisualizer>
                <div className="mt-3 md:mt-4 text-center">
                  <p className="text-white/80 text-xs md:text-sm font-medium">
                    {agentState === 'speaking' ? ' AI Speaking' : 
                     agentState === 'listening' ? ' AI Listening' : 
                     '⏸ Standby'}
                  </p>
                </div>
              </div>

              {/* Transcript Below Audio Bar */}
              <div className="w-full max-h-[200px] md:max-h-[300px] overflow-y-auto">
                <ChatTranscript />
              </div>
            </MotionContainer>
          )}

          {isAvatar && (
            // Avatar Agent (if ever used) - also overlaid
            <MotionContainer
              key="agent-avatar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={ANIMATION_TRANSITION}
              className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl max-w-md w-full aspect-video bg-black/40 backdrop-blur-xl"
            >
              <VideoTrack
                width={videoWidth}
                height={videoHeight}
                trackRef={agentVideoTrack}
                className="w-full h-full object-cover"
              />
            </MotionContainer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
