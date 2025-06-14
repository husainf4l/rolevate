#!/bin/bash

# LiveKit Agent PM2 Wrapper
# This script is used by PM2 to start the LiveKit agent

# Set the working directory
cd /home/husain/rolevate/livekit

# Activate virtual environment 
source venv/bin/activate

# Make sure we're using the correct port
export LIVEKIT_AGENT_PORT=8007

# Improve Python performance
export PYTHONUNBUFFERED=1
export PYTHONOPTIMIZE=2
# Set Python memory limits (1GB)
export PYTHONMALLOC=malloc
export MALLOC_TRIM_THRESHOLD_=65536
# Set memory ceiling for better GC behavior
export MPLBACKEND=Agg

# Improve network connectivity
echo "Testing connection to LiveKit server..."
host rolvate2-ckmk80qb.livekit.cloud || echo "Warning: Cannot resolve LiveKit server"

# Start the agent (no workers parameter needed, it auto-configures)
python agent.py start
