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
        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center relative p-4 md:p-8">
      {/* Main Agent Display */}
      <AnimatePresence mode="wait">
        {!isAvatar && (
          // Audio Agent - Compact bars
          <MotionContainer
            key="agent-audio"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={ANIMATION_TRANSITION}
            className="flex items-center justify-center w-full h-full max-w-md"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-12 border border-white/10 shadow-2xl">
              <BarVisualizer
                barCount={5}
                state={agentState}
                options={{ minHeight: 6 }}
                trackRef={agentAudioTrack}
                className={cn('flex h-20 md:h-32 items-center justify-center gap-1.5 md:gap-2')}
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
              <div className="mt-4 md:mt-6 text-center">
                <p className="text-white/60 text-xs md:text-sm font-medium">
                  {agentState === 'speaking' ? '🎙️ Speaking...' : 
                   agentState === 'listening' ? '👂 Listening...' : 
                   '⏸️ Idle'}
                </p>
              </div>
            </div>
          </MotionContainer>
        )}

        {isAvatar && (
          // Avatar Agent
          <MotionContainer
            key="agent-avatar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={ANIMATION_TRANSITION}
            className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full aspect-video bg-black/50 backdrop-blur-xl"
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

      {/* User Video - Top Right Corner (desktop) / Bottom Right (mobile) */}
      <AnimatePresence>
        {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
          <MotionContainer
            key="user-video"
            initial={{ opacity: 0, scale: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0, x: 20, y: -20 }}
            transition={ANIMATION_TRANSITION}
            className="absolute top-auto bottom-4 md:top-4 md:bottom-auto right-4 z-50"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <VideoTrack
                trackRef={cameraTrack || screenShareTrack}
                width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                className="relative bg-black/30 backdrop-blur-sm aspect-video w-32 md:w-48 rounded-xl md:rounded-2xl object-cover border border-white/10 shadow-xl"
              />
              <div className="absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 right-1.5 md:right-2">
                <div className="bg-black/60 backdrop-blur-md rounded-md md:rounded-lg px-1.5 md:px-2 py-0.5 md:py-1 text-center">
                  <p className="text-white/80 text-[10px] md:text-xs font-medium">You</p>
                </div>
              </div>
            </div>
          </MotionContainer>
        )}
      </AnimatePresence>
    </div>
  );
}
