import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

// don't cache the results
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const API_KEY = process.env.LIVEKIT_API_KEY;
    const API_SECRET = process.env.LIVEKIT_API_SECRET;
    const LIVEKIT_URL = process.env.LIVEKIT_URL;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: "Phone parameter is required" }, { status: 400 });
    }

    if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!API_KEY) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (!API_SECRET) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Use phone as a unique identifier for the room and participant
    // This ensures the same phone number always connects to the same room
    const roomName = `interview_${phone}`;
    const participantIdentity = `user_${phone}`;

    // Create token with appropriate grants
    const token = new AccessToken(API_KEY, API_SECRET, {
      identity: participantIdentity,
      ttl: "1h", // Token valid for 1 hour
    });

    // Add grants to the token
    const videoGrant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    token.addGrant(videoGrant);

    const jwt = token.toJwt();

    const headers = new Headers({
      "Cache-Control": "no-store",
    });

    return NextResponse.json({ token: jwt, room: roomName }, { headers });
  } catch (error) {
    console.error("LiveKit token generation error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
