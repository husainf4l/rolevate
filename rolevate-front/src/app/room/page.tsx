"use client";

import dynamic from 'next/dynamic';

// Dynamically import the room page with no SSR to prevent hydration issues
const RoomPageClient = dynamic(() => import('./room-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white">
          Loading Interview Room...
        </h2>
      </div>
    </div>
  )
});

export default function RoomPage() {
  return <RoomPageClient />;
}
