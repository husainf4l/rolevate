#!/bin/bash

# LiveKit Agent Startup Script
# This script starts the LiveKit interview agent

# Set the working directory
cd /home/husain/rolevate/livekit

# Activate virtual environment
source venv/bin/activate

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Start the agent in production mode
echo "Starting LiveKit Agent..."
python agent.py start

# If the script exits, wait and restart
while true; do
    echo "Agent stopped. Restarting in 10 seconds..."
    sleep 10
    python agent.py start
done
