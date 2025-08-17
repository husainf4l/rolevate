#!/bin/bash

# macOS Production Server Setup Script for Agent15
# This script configures macOS for 24/7 server operation

echo "🔧 Configuring macOS for Production Server Operation..."

# Power Management Settings
echo "⚡ Configuring Power Management..."
sudo pmset -a sleep 0          # Never sleep
sudo pmset -a disksleep 0      # Never sleep disks
sudo pmset -a standby 0        # Disable standby
sudo pmset -a womp 1           # Wake on network access
sudo pmset -a powernap 1       # Keep Power Nap for network connectivity
sudo pmset -a autorestart 1    # Auto restart after power failure
sudo pmset -a displaysleep 10  # Display sleep after 10 min (saves energy)
sudo pmset -a tcpkeepalive 1   # Keep TCP connections alive

echo "✅ Power management configured for 24/7 operation"

# Verify settings
echo "📋 Current Power Settings:"
pmset -g

echo ""
echo "🎯 macOS is now configured for production server use:"
echo "   ✅ System will never sleep"
echo "   ✅ Disks will never sleep"
echo "   ✅ Network connections stay alive"
echo "   ✅ Auto-restart after power failure"
echo "   ✅ Display sleeps after 10 minutes (energy saving)"
echo ""
echo "🚀 Your Mac is ready for 24/7 Agent15 operation!"
