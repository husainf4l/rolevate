import { useCallback, useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { ReadonlyURLSearchParams } from "next/navigation";
import { roomService, InterviewType, InterviewStatus } from "@/services/room.service";
import { applicationService } from "@/services/application.service";
import { authService } from "@/services/auth";
import { apolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";

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

      // Create interview via backend if needed
      if (!token && phone && jobId && backendRoomName) {
        console.log("🏗️ Creating interview via backend...");

        // Get current user as interviewer (optional for room access)
        const currentUser = await authService.getCurrentUser();
        
        // For room access, we allow unauthenticated users
        // If authenticated, try to create interview; otherwise proceed with direct room access
        let interview: any = null;
        if (currentUser) {
          // Find application by jobId and phone
          const application = await applicationService.getApplicationByJobAndPhone(jobId, phone);
          if (!application) {
            throw new Error("Application not found for this job and phone number");
          }

          // Generate room name if not provided
          const generatedRoomName = backendRoomName || roomService.generateRoomName(application.id);

          const interviewInput = {
            applicationId: application.id,
            interviewerId: currentUser.id,
            scheduledAt: new Date().toISOString(),
            type: InterviewType.TECHNICAL,
            status: InterviewStatus.IN_PROGRESS,
            roomId: generatedRoomName, // Pass the room name to backend
          };

          interview = await roomService.createInterviewRoom(interviewInput);

          console.log("✅ Interview created successfully:", interview);

          // Use roomId from interview response, fallback to generated name
          roomName = interview.roomId || generatedRoomName;

          console.log("🔍 Using room details:", {
            roomName,
            interviewId: interview.id,
            applicationId: application.id,
            hasToken: !!token,
          });

          // Extract enhanced data from interview response
          if (onJobDataUpdate) {
            const jobData = {
              title: interview.application.job.title,
              location: null,
              experience: null
            };

            const companyData = {
              name: interview.application.job.company.name
            };

            const participantData = interview.application.candidate.name;

            console.log("Extracted data:", { jobData, companyData, participantData });
            onJobDataUpdate(jobData, companyData, participantData);
          }
        } else {
          console.log("⚠️ User not authenticated, proceeding with direct room access");
          // Use backendRoomName as provided in URL
          roomName = backendRoomName;
          
          // For unauthenticated access, try to get token via GraphQL joinInterviewRoom
          if (!token) {
            try {
              // For unauthenticated room joining, use jobId, phone, and roomName
              // Backend should find the interview by these parameters
              
              const { data } = await apolloClient.query<{ joinInterviewRoom: { success: boolean; token?: string; roomName?: string; liveKitUrl?: string; error?: string } }>({
                query: gql`
                  query JoinInterviewRoom($jobId: ID!, $phone: String!, $roomName: String!, $participantName: String!) {
                    joinInterviewRoom(jobId: $jobId, phone: $phone, roomName: $roomName, participantName: $participantName) {
                      success
                      token
                      roomName
                      liveKitUrl
                      error
                    }
                  }
                `,
                variables: { 
                  jobId,
                  phone,
                  roomName: backendRoomName,
                  participantName: "Candidate" // Default participant name for unauthenticated access
                },
              });

              if (data?.joinInterviewRoom?.success && data.joinInterviewRoom.token) {
                token = data.joinInterviewRoom.token;
                roomName = data.joinInterviewRoom.roomName || backendRoomName;
                serverUrl = data.joinInterviewRoom.liveKitUrl || serverUrl;
                console.log("✅ Got room access token from GraphQL");
              } else {
                console.warn("⚠️ Failed to join room:", data?.joinInterviewRoom?.error);
              }
            } catch (error) {
              console.warn("⚠️ Could not get room access via GraphQL:", error);
            }
          }
        }
      }

      if (!token || !roomName) {
        console.error("Missing required parameters:", { token: !!token, roomName });
        const missing = [];
        if (!token) missing.push("LiveKit token");
        if (!roomName) missing.push("room name");
        throw new Error(`Missing required parameters: ${missing.join(", ")}. Please ensure you have the correct room link.`);
      }

      console.log("Connecting to LiveKit room:", { roomName, serverUrl });

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
      const connectionConfig: any = {
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

    } catch (err: any) {
      console.error("💥 Connection failed:", err);
      isConnectingRef.current = false;

      // Provide mobile-specific error messages
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      let errorMessage = err.message || "Failed to connect to room";

      if (isMobile) {
        if (err.message?.includes('websocket') || err.message?.includes('network')) {
          errorMessage = "Mobile connection issue detected. Please check your internet connection and try again.";
        } else if (err.message?.includes('media') || err.message?.includes('camera') || err.message?.includes('microphone')) {
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