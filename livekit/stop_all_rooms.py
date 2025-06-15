#!/usr/bin/env python3
"""
Script to stop all active LiveKit rooms
"""

import asyncio
import os
from dotenv import load_dotenv
from livekit.api import LiveKitAPI, ListRoomsRequest, DeleteRoomRequest

load_dotenv()

async def stop_all_rooms():
    """Stop all active rooms"""
    
    # Get LiveKit credentials from environment
    livekit_url = os.getenv('LIVEKIT_URL')
    livekit_api_key = os.getenv('LIVEKIT_API_KEY')
    livekit_api_secret = os.getenv('LIVEKIT_API_SECRET')
    
    if not all([livekit_url, livekit_api_key, livekit_api_secret]):
        print("ERROR: Missing LiveKit credentials in environment variables")
        print("Required: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET")
        return
    
    print("🔄 Fetching and stopping all active rooms...")
    
    try:
        # Create LiveKit API client
        lkapi = LiveKitAPI(
            livekit_url,
            livekit_api_key,
            livekit_api_secret
        )
        
        # Get all active rooms
        rooms = await lkapi.room.list_rooms(ListRoomsRequest())
        
        if not rooms.rooms:
            print("✅ No active rooms found")
            return
        
        print(f"📊 Found {len(rooms.rooms)} room(s)")
        
        # Stop each room
        for room in rooms.rooms:
            try:
                print(f"🛑 Stopping room: {room.name}")
                await lkapi.room.delete_room(DeleteRoomRequest(room=room.name))
                print(f"✅ Successfully stopped room: {room.name}")
            except Exception as e:
                print(f"❌ Failed to stop room {room.name}: {str(e)}")
        
        print(f"\n🎉 Completed stopping {len(rooms.rooms)} rooms")
        
    except Exception as e:
        print(f"❌ Error accessing LiveKit API: {str(e)}")

async def stop_specific_rooms():
    """Stop only the specific rooms from the list"""
    
    # Room names to stop
    ROOM_NAMES = [
        "interview_3152b247-ff32-42e6-b6fb-601bbe8e04a0_8244",
        "interview_3152b247-ff32-42e6-b6fb-601bbe8e04a0_7734",
        "interview_3c5a3be7-fd23-4442-87b4-8ad0ef33fff9_7558",
        "interview_3c5a3be7-fd23-4442-87b4-8ad0ef33fff9_2767",
        "interview_3c5a3be7-fd23-4442-87b4-8ad0ef33fff9_3684",
        "interview_3c5a3be7-fd23-4442-87b4-8ad0ef33fff9_3615"
    ]
    
    # Get LiveKit credentials from environment
    livekit_url = os.getenv('LIVEKIT_URL')
    livekit_api_key = os.getenv('LIVEKIT_API_KEY')
    livekit_api_secret = os.getenv('LIVEKIT_API_SECRET')
    
    if not all([livekit_url, livekit_api_key, livekit_api_secret]):
        print("ERROR: Missing LiveKit credentials in environment variables")
        print("Required: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET")
        return
    
    print("🔄 Stopping specific rooms...")
    
    try:
        # Create LiveKit API client
        lkapi = LiveKitAPI(
            livekit_url,
            livekit_api_key,
            livekit_api_secret
        )
        
        # Stop specific rooms by name
        for room_name in ROOM_NAMES:
            try:
                print(f"🛑 Stopping room: {room_name}")
                await lkapi.room.delete_room(DeleteRoomRequest(room=room_name))
                print(f"✅ Successfully stopped room: {room_name}")
            except Exception as e:
                print(f"❌ Failed to stop room {room_name}: {str(e)}")
        
        print(f"\n🎉 Completed stopping {len(ROOM_NAMES)} specific rooms")
        
    except Exception as e:
        print(f"❌ Error accessing LiveKit API: {str(e)}")

async def main():
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--specific":
        await stop_specific_rooms()
    else:
        await stop_all_rooms()

if __name__ == "__main__":
    asyncio.run(main())
