import { useCallback, useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { ReadonlyURLSearchParams } from "next/navigation";
import { API_CONFIG } from "@/lib/config";
import { JobInfo, CompanyInfo } from "../types/interview";

interface UseRoomConnectionProps {
  room: Room;
  searchParams: ReadonlyURLSearchParams;
  onConnectionChange: (connected: boolean, connecting: boolean) => void;
  onError: (error: string | null) => void;
  onJobDataUpdate?: (jobData: JobInfo | null, companyData: CompanyInfo | null, participantData: string) => void;
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
          `${API_CONFIG.BASE_URL}/room/create-new-room`,
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
          const jobData: JobInfo = {
            title: createData.room?.metadata?.jobName || createData.interviewContext?.jobName || undefined,
            location: createData.room?.metadata?.jobLocation || createData.interviewContext?.jobLocation || undefined,
            experience: createData.room?.metadata?.jobExperience || createData.interviewContext?.jobExperience || undefined
          };

          const companyData: CompanyInfo = {
            name: createData.room?.metadata?.companyName || createData.interviewContext?.companyName || undefined
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

      // Add mobile-specific error handling
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      room.on("connected", () => {
        console.log("✅ Room connected successfully");
        isConnectingRef.current = false;
        onConnectionChange(true, false);
      });

      room.on("disconnected", (reason) => {
        console.log("❌ Room disconnected:", reason);
        isConnectingRef.current = false;
        onConnectionChange(false, false);

        // Handle mobile-specific disconnection scenarios
        if (isMobile) {
          console.log("🔄 Mobile disconnection detected, preparing for potential recovery...");
          setTimeout(() => {
            if (room.state !== 'connected') {
              console.log("🔄 Room still disconnected on mobile device");
              // Don't automatically reconnect to avoid loops, let user retry
            }
          }, 2000);
        }
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

      // Add mobile-specific connection error handling
      room.on("connectionQualityChanged", (quality) => {
        if (isMobile && quality === 'poor') {
          console.warn("⚠️ Poor connection quality detected on mobile device");
          // Could implement automatic quality reduction here
        }
      });

      // Connect to room with mobile-optimized settings
      const connectionConfig: Record<string, unknown> = {
        autoSubscribe: true,
        rtcConfig: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
          // Add mobile-specific ICE configuration
          ...(isMobile && {
            iceTransportPolicy: 'all' as RTCIceTransportPolicy,
            bundlePolicy: 'max-bundle' as RTCBundlePolicy,
            rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
          }),
        },
        // Mobile-specific audio optimizations for better clarity
        ...(isMobile && {
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000, // Higher sample rate for better quality
            channelCount: 1, // Mono to reduce bandwidth
          },
          audioPlaybackDefaults: {
            autoGainControl: false, // Disable AGC for playback
            echoCancellation: false, // Not needed for playback
            noiseSuppression: false, // Not needed for playback
          },
        }),
      };

      await room.connect(serverUrl, token, connectionConfig);

      console.log("🎤📹 Attempting to enable microphone and camera...");
      // Enable media with graceful fallback and simplified mobile handling
      try {
        // Simplified microphone settings to prevent crashes
        const micOptions = isMobile ?
          { echoCancellation: true, noiseSuppression: true } :
          { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

        await room.localParticipant.setMicrophoneEnabled(true, micOptions);
        console.log("✅ Microphone enabled successfully");
      } catch (micError) {
        console.warn("⚠️ Could not enable microphone:", micError);
        // Try with basic settings if advanced ones fail
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          console.log("✅ Microphone enabled with basic settings");
        } catch (basicMicError) {
          console.error("❌ Failed to enable microphone with basic settings:", basicMicError);
        }
      }

      try {
        const cameraConstraints = isMobile ?
          { resolution: { width: 640, height: 480, frameRate: 15 } } :
          { resolution: { width: 1280, height: 720, frameRate: 30 } };

        await room.localParticipant.setCameraEnabled(true, cameraConstraints);
        console.log("✅ Camera enabled successfully");
      } catch (camError) {
        console.warn("⚠️ Could not enable camera:", camError);
      }

      console.log("✅ Room connection completed (media may be limited)");

    } catch (err: unknown) {
      console.error("💥 Connection failed:", err);
      isConnectingRef.current = false;

      // Provide mobile-specific error messages
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      let errorMessage = "Failed to connect to room";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      if (isMobile) {
        if (err instanceof Error && (err.message?.includes('websocket') || err.message?.includes('network'))) {
          errorMessage = "Mobile connection issue detected. Please check your internet connection and try again.";
        } else if (err instanceof Error && (err.message?.includes('media') || err.message?.includes('camera') || err.message?.includes('microphone'))) {
          errorMessage = "Camera or microphone access failed. Please check permissions and try again.";
        }
      }

      onError(errorMessage);
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