#!/bin/bash

# Script to stop all LiveKit rooms
# Make sure your .env file has LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET

source .env

echo "🔄 Stopping ALL LiveKit rooms..."

# Check if livekit-cli is available
if ! command -v livekit-cli &> /dev/null; then
    echo "❌ livekit-cli not found. Using Python script instead..."
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
    python3 stop_all_rooms.py --all
    exit 0
fi

# Get all active rooms
echo "📋 Fetching all active rooms..."
ROOM_LIST=$(livekit-cli list-rooms \
    --url "$LIVEKIT_URL" \
    --api-key "$LIVEKIT_API_KEY" \
    --api-secret "$LIVEKIT_API_SECRET" \
    --output json 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$ROOM_LIST" ]; then
    echo "❌ Failed to fetch room list or no rooms found"
    exit 1
fi

# Extract room names from JSON output
ROOMS=$(echo "$ROOM_LIST" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ROOMS" ]; then
    echo "✅ No active rooms found"
    exit 0
fi

echo "Found $(echo "$ROOMS" | wc -l) active room(s)"

# Stop each room
echo "$ROOMS" | while read -r room; do
    if [ -n "$room" ]; then
        echo "🛑 Stopping room: $room"
        livekit-cli delete-room \
            --url "$LIVEKIT_URL" \
            --api-key "$LIVEKIT_API_KEY" \
            --api-secret "$LIVEKIT_API_SECRET" \
            --room "$room"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully stopped room: $room"
        else
            echo "❌ Failed to stop room: $room"
        fi
    fi
done

echo "🎉 Completed stopping rooms"
