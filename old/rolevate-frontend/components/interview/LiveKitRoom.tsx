"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  RoomOptions,
  ConnectionState,
  AudioTrack,
  LocalParticipant,
  RemoteParticipant,
  Participant,
  AudioPresets,
  createLocalAudioTrack,
} from "livekit-client";
import livekitService from "../../services/livekit-service";

interface LiveKitRoomProps {
  token: string;
  serverUrl: string;
  onConnectionStateChanged: (state: string) => void;
  onParticipantConnected: (participant: Participant) => void;
  onParticipantDisconnected: (participant: Participant) => void;
  onDataReceived: (data: any) => void;
  onError: (error: Error) => void;
  children?: React.ReactNode;
}

export const LiveKitRoom = ({
  token,
  serverUrl,
  onConnectionStateChanged,
  onParticipantConnected,
  onParticipantDisconnected,
  onDataReceived,
  onError,
  children,
}: LiveKitRoomProps) => {
  const [room, setRoom] = useState<Room | null>(null);

  // Connect to the LiveKit room
  const connectToRoom = useCallback(async () => {
    try {
      if (!token || !serverUrl) {
        throw new Error("Token or server URL is missing");
      }

      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          audioPreset: AudioPresets.music,
        },
      };

      // Create a new room
      const newRoom = new Room(roomOptions);

      // Set up event listeners
      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        onConnectionStateChanged(state);
      });

      newRoom.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          onParticipantConnected(participant);
        }
      );

      newRoom.on(
        RoomEvent.ParticipantDisconnected,
        (participant: RemoteParticipant) => {
          onParticipantDisconnected(participant);
        }
      );

      // Set up data message handling
      livekitService.setupMessageHandlers(newRoom, (message) => {
        onDataReceived(message);
      });

      // Connect to the room
      await newRoom.connect(serverUrl, token);
      console.log("Connected to room:", newRoom.name);

      // Create and publish local audio track
      const audioTrack = await createLocalAudioTrack();
      await newRoom.localParticipant.publishTrack(audioTrack);

      setRoom(newRoom);
    } catch (error) {
      console.error("Error connecting to room:", error);
      onError(error as Error);
    }
  }, [
    token,
    serverUrl,
    onConnectionStateChanged,
    onParticipantConnected,
    onParticipantDisconnected,
    onDataReceived,
    onError,
  ]);

  // Connect to the room when the component mounts
  useEffect(() => {
    connectToRoom();

    // Clean up when the component unmounts
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [connectToRoom, room]);

  return <div className="livekit-room">{children}</div>;
};

export default LiveKitRoom;
