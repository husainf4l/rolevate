'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { SessionView } from './components/SessionView';
import { PreRoomSetup } from './components/PreRoomSetup';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';



function LoadingScreen({ message = 'Connecting to interview room...' }: { message?: string }) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [setupComplete, setSetupComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [wsURL, setWSURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only connect after setup is complete
    if (!setupComplete) return;

    let isMounted = true;
    let retryTimeoutId: NodeJS.Timeout | null = null;

    // Prevent media autoplay warnings - but be gentle with LiveKit elements
    const preventAutoplayWarnings = () => {
      // Use a MutationObserver to handle dynamically added media elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLMediaElement) {
              // Only apply muting to non-LiveKit elements to prevent interference
              if (!node.hasAttribute('data-lk-audio') && !node.hasAttribute('data-lk-video')) {
                try {
                  node.muted = true;
                } catch (e) {
                  console.debug('Mute error (expected):', e);
                }
              }
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      return () => observer.disconnect();
    };

    const connectToRoom = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        
        // Get applicationId from URL
        const applicationId = searchParams?.get('applicationId');
        
        if (!applicationId) {
          setError('Missing application ID. Please use a valid interview invitation link.');
          setIsLoading(false);
          return;
        }

        console.log('🔑 Creating interview room for applicationId:', applicationId, 'Retry:', retryCount);

        // Create interview room and get token from backend
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

        console.log('✅ Interview room created:', {
          hasToken: !!data?.createInterviewRoom?.token,
          roomName: data?.createInterviewRoom?.roomName,
        });

        // Debug audio environment for production compatibility
        if (typeof window !== 'undefined') {
          console.group('🎵 Audio Environment Debug (Room Creation)');
          console.log('Protocol:', window.location.protocol);
          console.log('Hostname:', window.location.hostname);
          console.log('Is Production:', window.location.hostname !== 'localhost');
          console.log('User Agent:', navigator.userAgent);
          console.log('Has getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
          console.log('Has AudioContext:', !!(window.AudioContext || (window as any).webkitAudioContext));
          console.groupEnd();
        }

        if (data?.createInterviewRoom?.token) {
          const token = data.createInterviewRoom.token;
          const serverUrl = 'wss://rolevate-pf7kl7to.livekit.cloud';
          
          setRoomToken(token);
          setWSURL(serverUrl);
          setIsConnected(true);
          setIsLoading(false);
        } else {
          throw new Error('Failed to get access token for interview room');
        }
      } catch (err: any) {
        console.error('❌ Failed to create interview room:', err);
        
        // Handle rate limiting (429 error)
        if (err.message?.includes('429') || err.message?.toLowerCase().includes('rate limit')) {
          if (retryCount < 3 && isMounted) {
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
            console.log(`⏰ Rate limited. Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/3)`);
            setError(`Rate limited. Retrying in ${Math.ceil(retryDelay / 1000)} seconds...`);
            
            retryTimeoutId = setTimeout(() => {
              if (isMounted) {
                connectToRoom(retryCount + 1);
              }
            }, retryDelay);
            return;
          } else {
            setError('Service temporarily unavailable due to high usage. Please wait a few minutes and try again.');
          }
        } else {
          setError(err.message || 'Failed to connect to interview room. Please try again.');
        }
        setIsLoading(false);
      }
    };

    connectToRoom();
    const cleanupObserver = preventAutoplayWarnings();

    // Cleanup function
    return () => {
      isMounted = false;
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      
      // Cleanup mutation observer
      if (cleanupObserver) {
        cleanupObserver();
      }
      
      // Gentle cleanup - only cleanup non-LiveKit media elements
      const mediaElements = document.querySelectorAll('audio:not([data-lk-audio]), video:not([data-lk-video])');
      mediaElements.forEach((element) => {
        if (element instanceof HTMLMediaElement) {
          try {
            // Only pause if not already paused to prevent interruption errors
            if (!element.paused) {
              element.pause();
            }
          } catch (e) {
            // Ignore AbortError and other cleanup errors
            console.debug('Media cleanup error (expected):', e);
          }
        }
      });
    };
  }, [searchParams, setupComplete]);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    router.push('/');
  }, [router]);

  // Show pre-room setup first
  if (!setupComplete) {
    return <PreRoomSetup onComplete={() => setSetupComplete(true)} />;
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/userdashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !isConnected || !roomToken || !wsURL) {
    return <LoadingScreen message={isLoading ? 'Creating interview room...' : 'Connecting...'} />;
  }

  return (
    <LiveKitRoom
      token={roomToken}
      serverUrl={wsURL}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={handleDisconnected}
      className="h-screen w-screen overflow-hidden"
    >
      <SessionView />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading interview..." />}>
      <RoomContent />
    </Suspense>
  );
}
