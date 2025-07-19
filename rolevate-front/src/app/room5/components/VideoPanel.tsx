import React from "react";
import {
  ParticipantTile,
  useRoomContext,
  useIsSpeaking,
} from "@livekit/components-react";
import { Participant, Track } from "livekit-client";
import { useAudioVisualization } from "../hooks/useAudioVisualization";
import { motion } from "framer-motion";

const VideoWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-slate-900">
    {children}
  </div>
);

const ParticipantInfo = ({
  displayName,
  isSpeaking,
}: {
  displayName: string;
  isSpeaking: boolean;
}) => (
  <div
    className={`absolute bottom-4 left-4 z-10 p-2 rounded-lg transition-all duration-300 ${
      isSpeaking ? "bg-green-500/80" : "bg-black/30 backdrop-blur-sm"
    }`}
  >
    <p className="text-white font-semibold text-sm">{displayName}</p>
  </div>
);

const AudioVisualizer = ({ participant }: { participant: Participant }) => {
  const { canvasRef } = useAudioVisualization(participant);
  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
};

export function VideoPanel() {
  const room = useRoomContext();
  const remoteParticipants = Array.from(room.remoteParticipants.values());
  const remoteParticipant = remoteParticipants[0] || undefined;
  const isLocalSpeaking = useIsSpeaking(room.localParticipant);
  const isRemoteSpeaking = useIsSpeaking(remoteParticipant);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
      <VideoWrapper>
        <ParticipantTile
          trackRef={{
            participant: room.localParticipant,
            source: Track.Source.Camera,
            publication: room.localParticipant.getTrackPublication(
              Track.Source.Camera
            )!,
          }}
        />
        <ParticipantInfo displayName="You" isSpeaking={isLocalSpeaking} />
        {isLocalSpeaking && (
          <AudioVisualizer participant={room.localParticipant} />
        )}
      </VideoWrapper>
      <VideoWrapper>
        {remoteParticipant ? (
          <>
            <ParticipantTile
              trackRef={{
                participant: remoteParticipant,
                source: Track.Source.Camera,
                publication: remoteParticipant.getTrackPublication(
                  Track.Source.Camera
                )!,
              }}
            />
            <ParticipantInfo
              displayName={remoteParticipant.identity}
              isSpeaking={isRemoteSpeaking}
            />
            {isRemoteSpeaking && (
              <AudioVisualizer participant={remoteParticipant} />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-400">Waiting for participant...</p>
          </div>
        )}
      </VideoWrapper>
    </div>
  );
}
