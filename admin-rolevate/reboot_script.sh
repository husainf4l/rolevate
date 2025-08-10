#!/bin/bash

# Aggressive reboot script
echo "Starting aggressive system reboot..."

# Check if we have sudo access
echo "tt55oo77" | sudo -S echo "Sudo access confirmed"

# Kill ALL processes that might interfere
echo "Killing all user processes..."
echo "tt55oo77" | sudo -S killall -9 -u $(whoami) 2>/dev/null || true

# Sync file systems
echo "Syncing file systems..."
echo "tt55oo77" | sudo -S sync

# Try emergency reboot first
echo "Attempting emergency reboot..."
echo "tt55oo77" | sudo -S systemctl --force --force reboot

# Wait and try standard methods
sleep 3
echo "Emergency reboot failed, trying standard reboot..."
echo "tt55oo77" | sudo -S reboot

# Try shutdown method
sleep 3
echo "Standard reboot failed, trying shutdown..."
echo "tt55oo77" | sudo -S shutdown -r 0

# Try halt method
sleep 3
echo "Shutdown failed, trying halt..."
echo "tt55oo77" | sudo -S halt --reboot --force

# Final attempt with SysRq
sleep 3
echo "Using SysRq magic trigger..."
echo "tt55oo77" | sudo -S sh -c 'echo 1 > /proc/sys/kernel/sysrq && echo b > /proc/sysrq-trigger'
