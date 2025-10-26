'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { SessionView } from './components/SessionView';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

function LoadingScreen({ message = 'Connecting to interview room...' }: { message?: string }) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
  const [isConnected, setIsConnected] = useState(false);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [wsURL, setWSURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        setIsLoading(true);
        
        // Get applicationId from URL
        const applicationId = searchParams?.get('applicationId');
        
        if (!applicationId) {
          setError('Missing application ID. Please use a valid interview invitation link.');
          setIsLoading(false);
          return;
        }

        console.log('🔑 Creating interview room for applicationId:', applicationId);

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

        if (data?.createInterviewRoom?.token) {
          const token = data.createInterviewRoom.token;
          const serverUrl = 'wss://rolvate2-ckmk80qb.livekit.cloud';
          
          setRoomToken(token);
          setWSURL(serverUrl);
          setIsConnected(true);
          setIsLoading(false);
        } else {
          throw new Error('Failed to get access token for interview room');
        }
      } catch (err: any) {
        console.error('❌ Failed to create interview room:', err);
        setError(err.message || 'Failed to connect to interview room. Please try again.');
        setIsLoading(false);
      }
    };

    connectToRoom();
  }, [searchParams]);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    router.push('/userdashboard');
  }, [router]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
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
      className="h-screen w-screen"
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
