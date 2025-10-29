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
      const applicationId = searchParams.get("applicationId");

      console.log("📋 Connection parameters:", {
        directToken: !!directToken,
        directRoomName,
        directServerUrl,
        applicationId
      });

      let token = directToken;
      let roomName = directRoomName;
      let serverUrl = directServerUrl || "wss://rolvate2-ckmk80qb.livekit.cloud";

      // If we have applicationId but no token, create interview room and get token
      if (applicationId && !token) {
        console.log("🔑 Creating interview room for applicationId:", applicationId);
        
        try {
          // Mutation to create interview room and get token directly
          const { data } = await apolloClient.mutate<{ 
            createInterviewRoom: { 
              roomName: string;
              token: string;
              message?: string;
            } 
          }>({
            mutation: gql`
              mutation CreateInterviewRoom($createRoomInput: CreateRoomInput!) {
                createInterviewRoom(createRoomInput: $createRoomInput) {
                  roomName
                  token
                  message
                }
              }
            `,
            variables: { 
              createRoomInput: {
                applicationId
              }
            },
          });

          console.log("🔍 Create Interview Room Response:", {
            hasData: !!data?.createInterviewRoom,
            hasToken: !!data?.createInterviewRoom?.token,
            roomName: data?.createInterviewRoom?.roomName,
            message: data?.createInterviewRoom?.message,
            fullData: data
          });

          if (data?.createInterviewRoom?.token) {
            token = data.createInterviewRoom.token;
            roomName = data.createInterviewRoom.roomName || roomName;
            
            console.log("✅ Got token and room details from interview room creation", {
              hasToken: !!token,
              roomName,
              serverUrl
            });

            // Now fetch application details to get job and candidate info
            try {
              const { data: appData } = await apolloClient.query<{
                application: {
                  candidate: {
                    name: string;
                  };
                  job: {
                    title: string;
                    company: {
                      name: string;
                    };
                  };
                }
              }>({
                query: gql`
                  query GetApplication($id: ID!) {
                    application(id: $id) {
                      candidate {
                        name
                      }
                      job {
                        title
                        company {
                          name
                        }
                      }
                    }
                  }
                `,
                variables: { id: applicationId },
                fetchPolicy: 'network-only'
              });

              if (onJobDataUpdate && appData?.application) {
                const jobData = {
                  title: appData.application.job.title,
                  location: null
                };
                const companyData = {
                  name: appData.application.job.company.name
                };
                const participantData = appData.application.candidate.name;
                
                console.log("📋 Extracted data from application:", { jobData, companyData, participantData });
                onJobDataUpdate(jobData, companyData, participantData);
              }
            } catch (appError) {
              console.warn("⚠️ Could not fetch application details:", appError);
              // Continue anyway, room connection is more important
            }
          } else {
            console.error("❌ No token returned from createInterviewRoom");
            throw new Error("Failed to get access token for interview room");
          }
        } catch (error: any) {
          console.error("❌ Failed to create interview room:", error);
          console.error("Error details:", {
            message: error.message,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError
          });
          throw new Error(error.message || "Failed to create interview room. Please check your invitation link.");
        }
      }

      if (!token || !roomName) {
        console.error("Missing required parameters after processing:", { 
          token: !!token, 
          roomName,
          applicationId,
          directToken: !!directToken,
          directRoomName 
        });
        const missing = [];
        if (!token) missing.push("LiveKit token");
        if (!roomName) missing.push("room name");
        
        // More helpful error message
        if (applicationId) {
          throw new Error(`Failed to get ${missing.join(", ")} from backend for this application. Please ensure the application ID is valid and the interview is scheduled.`);
        } else {
          throw new Error(`Missing required parameters: ${missing.join(", ")}. Please use a valid interview invitation link with applicationId parameter.`);
        }
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