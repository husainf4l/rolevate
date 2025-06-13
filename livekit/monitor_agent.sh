#!/bin/bash

# LiveKit Agent Monitor Script
# This script checks if the agent is running and restarts it if needed

AGENT_DIR="/home/husain/rolevate/livekit"
PIDFILE="$AGENT_DIR/agent.pid"
LOGFILE="$AGENT_DIR/monitor.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOGFILE"
}

# Function to check if agent is running
is_agent_running() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            # Check if it's actually our agent process
            if ps -p "$PID" -o comm= | grep -q python; then
                return 0
            fi
        fi
    fi
    return 1
}

# Function to start the agent
start_agent() {
    cd "$AGENT_DIR"
    source venv/bin/activate
    
    # Kill any existing agent processes
    pkill -f "python agent.py" > /dev/null 2>&1
    
    # Start the agent in background
    nohup python agent.py start > agent_output.log 2>&1 &
    
    # Save the PID
    echo $! > "$PIDFILE"
    
    log_message "Agent started with PID: $!"
}

# Main logic
if is_agent_running; then
    log_message "Agent is running (PID: $(cat $PIDFILE))"
else
    log_message "Agent is not running. Starting..."
    start_agent
fi
