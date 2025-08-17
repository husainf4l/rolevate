#!/bin/bash

# Agent15 Startup Script for macOS
# This script ensures proper environment setup on system startup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/logs/startup.log"

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Log startup
echo "[$(date)] Starting Agent15 startup script..." >> "$LOG_FILE"

# Wait a bit for system to be ready
sleep 10

# Change to project directory
cd "$SCRIPT_DIR"

# Check if PM2 is running
if ! pgrep -f "PM2" > /dev/null; then
    echo "[$(date)] PM2 not running, starting..." >> "$LOG_FILE"
    # Start PM2 daemon
    pm2 ping >> "$LOG_FILE" 2>&1
fi

# Check if agent15 is running
if ! pm2 list | grep -q "livekit-agent15.*online"; then
    echo "[$(date)] Agent15 not running, starting..." >> "$LOG_FILE"
    # Start agent15
    pm2 start ecosystem-agent15.config.js >> "$LOG_FILE" 2>&1
    echo "[$(date)] Agent15 startup complete" >> "$LOG_FILE"
else
    echo "[$(date)] Agent15 already running" >> "$LOG_FILE"
fi

# Health check
sleep 5
pm2 status livekit-agent15 >> "$LOG_FILE" 2>&1

echo "[$(date)] Startup script completed" >> "$LOG_FILE"
