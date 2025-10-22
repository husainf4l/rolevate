import { TrackReferenceOrPlaceholder, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo } from "react";

export default function useLocalMicTrack() {
  const { microphoneTrack, localParticipant } = useLocalParticipant();

  const micTrackRef: TrackReferenceOrPlaceholder = useMemo(() => {
    if (microphoneTrack) {
      return {
        participant: localParticipant,
        source: Track.Source.Microphone,
        publication: microphoneTrack,
      };
    } else {
      return {
        participant: localParticipant,
        source: Track.Source.Microphone,
      };
    }
  }, [localParticipant, microphoneTrack]);

  return micTrackRef;
}
