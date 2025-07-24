#!/bin/bash
# PM2 Auto-Startup Management Script
# This script helps manage PM2 startup configuration

PM2_BIN="/usr/local/lib/node_modules/pm2/bin/pm2"
DUMP_FILE="/home/husain/.pm2/dump.pm2"

case "$1" in
    save)
        echo "💾 Saving current PM2 process list..."
        $PM2_BIN save
        echo "✅ PM2 processes saved to $DUMP_FILE"
        ;;
    
    resurrect)
        echo "🔄 Resurrecting PM2 processes..."
        $PM2_BIN resurrect
        echo "✅ PM2 processes restored"
        ;;
    
    status)
        echo "📊 PM2 Status:"
        $PM2_BIN status
        echo ""
        echo "🔧 Startup Configuration:"
        echo "  - Cron job: $(crontab -l | grep '@reboot.*pm2')"
        echo "  - Dump file: $DUMP_FILE"
        if [ -f "$DUMP_FILE" ]; then
            echo "  - Dump file exists: ✅"
        else
            echo "  - Dump file exists: ❌"
        fi
        ;;
    
    test-startup)
        echo "🧪 Testing startup simulation..."
        echo "Killing all PM2 processes..."
        $PM2_BIN kill
        echo "Waiting 3 seconds..."
        sleep 3
        echo "Resurrecting processes..."
        $PM2_BIN resurrect
        echo "✅ Startup test completed"
        ;;
    
    *)
        echo "🚀 PM2 Auto-Startup Manager"
        echo ""
        echo "Usage: $0 {save|resurrect|status|test-startup}"
        echo ""
        echo "Commands:"
        echo "  save         - Save current PM2 process list"
        echo "  resurrect    - Restore PM2 processes from saved list"
        echo "  status       - Show PM2 status and startup configuration"
        echo "  test-startup - Simulate system restart (kills & resurrects)"
        echo ""
        echo "Current PM2 Status:"
        $PM2_BIN status
        ;;
esac
