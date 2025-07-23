import { useCallback, useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { ReadonlyURLSearchParams } from "next/navigation";

interface UseRoomConnectionProps {
  room: Room;
  searchParams: ReadonlyURLSearchParams;
  onConnectionChange: (connected: boolean, connecting: boolean) => void;
  onError: (error: string | null) => void;
  onJobDataUpdate?: (jobData: any, companyData: any, participantData: string) => void;
}

export function useRoomConnection({
  room,
  searchParams,
  onConnectionChange,
  onError,
  onJobDataUpdate
}: UseRoomConnectionProps) {
  const isConnectingRef = useRef(false);

  const connectToRoom = useCallback(async () => {
    if (isConnectingRef.current) {
      console.log("⚠️ Connection already in progress, skipping...");
      return;
    }
    try {
      isConnectingRef.current = true;
      console.log("🔄 Starting room connection...");
      onConnectionChange(false, true);
      onError(null);

      // Extract connection parameters
      const directToken = searchParams.get("token");
      const directRoomName = searchParams.get("roomName");
      const directServerUrl = searchParams.get("serverUrl");
      const phone = searchParams.get("phone");
      const jobId = searchParams.get("jobId");
      const backendRoomName = searchParams.get("roomName");

      console.log("📋 Connection parameters:", {
        directToken: !!directToken,
        directRoomName,
        directServerUrl,
        phone,
        jobId,
        backendRoomName
      });

      let token = directToken;
      let roomName = directRoomName;
      let serverUrl = directServerUrl || "wss://rolvate2-ckmk80qb.livekit.cloud";

      // Create room via backend if needed
      if (!token && phone && jobId && backendRoomName) {
        console.log("🏗️ Creating room via backend...");
        const createResponse = await fetch(
          "https://rolevate.com/api/room/create-new-room",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId, phone, roomName: backendRoomName }),
          }
        );

        if (!createResponse.ok) {
          throw new Error(`Failed to create room: ${await createResponse.text()}`);
        }

        const createData = await createResponse.json();
        console.log("✅ Room created successfully:", createData);

        token = createData.token;
        roomName = createData.room?.name || createData.roomName;
        serverUrl = createData.liveKitUrl;

        console.log("🔍 Extracted connection details:", {
          token: !!token,
          roomName,
          serverUrl,
          roomFromResponse: createData.room?.name,
          fallbackRoom: createData.roomName
        });

        // Extract enhanced data from backend response
        if (onJobDataUpdate) {
          // Extract job data from the response structure
          const jobData = {
            title: createData.room?.metadata?.jobName || createData.interviewContext?.jobName,
            location: null, // Not provided in response
            experience: null // Not provided in response
          };

          const companyData = {
            name: createData.room?.metadata?.companyName || createData.interviewContext?.companyName
          };

          const participantData = createData.participantName || createData.room?.metadata?.candidateName || createData.interviewContext?.candidateName;

          console.log("📊 Extracted data:", { jobData, companyData, participantData });
          onJobDataUpdate(jobData, companyData, participantData);
        }
      }

      if (!token || !roomName) {
        console.error("❌ Missing required parameters:", { token: !!token, roomName });
        throw new Error(`Missing required parameters - token: ${!!token}, roomName: ${!!roomName}`);
      }

      console.log("🚀 Connecting to LiveKit room:", { roomName, serverUrl });

      // Setup room event listeners
      room.removeAllListeners();
      room.on("connected", () => {
        console.log("✅ Room connected successfully");
        isConnectingRef.current = false;
        onConnectionChange(true, false);
      });
      room.on("disconnected", (reason) => {
        console.log("❌ Room disconnected:", reason);
        isConnectingRef.current = false;
        onConnectionChange(false, false);
      });
      room.on("reconnecting", () => {
        console.log("🔄 Room reconnecting...");
        onConnectionChange(false, true);
      });
      room.on("reconnected", () => {
        console.log("✅ Room reconnected");
        isConnectingRef.current = false;
        onConnectionChange(true, false);
      });

      // Connect to room
      await room.connect(serverUrl, token, {
        autoSubscribe: true,
        rtcConfig: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      console.log("🎤📹 Attempting to enable microphone and camera...");
      // Enable media with graceful fallback
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log("✅ Microphone enabled successfully");
      } catch (micError) {
        console.warn("⚠️ Could not enable microphone:", micError);
      }

      try {
        await room.localParticipant.setCameraEnabled(true, {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        });
        console.log("✅ Camera enabled successfully");
      } catch (camError) {
        console.warn("⚠️ Could not enable camera:", camError);
      }

      console.log("✅ Room connection completed (media may be limited)");

    } catch (err: any) {
      console.error("💥 Connection failed:", err);
      isConnectingRef.current = false;
      onError(err.message || "Failed to connect to room");
      onConnectionChange(false, false);
    }
  }, [room, searchParams, onConnectionChange, onError, onJobDataUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return "Are you sure you want to leave? This will end the interview.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      room.disconnect();
    };
  }, [room]);

  return { connectToRoom };
}