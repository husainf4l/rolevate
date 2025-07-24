#!/bin/bash

# LiveKit Agent11 Management Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
    start)
        echo "Starting LiveKit Agent11..."
        pm2 start ecosystem.config.js
        ;;
    stop)
        echo "Stopping LiveKit Agent11..."
        pm2 stop livekit-agent11
        ;;
    restart)
        echo "Restarting LiveKit Agent11..."
        pm2 restart livekit-agent11
        ;;
    status)
        echo "LiveKit Agent11 status:"
        pm2 status livekit-agent11
        ;;
    logs)
        echo "Showing LiveKit Agent11 logs:"
        pm2 logs livekit-agent11
        ;;
    monitor)
        echo "Opening PM2 monitor:"
        pm2 monit
        ;;
    delete)
        echo "Deleting LiveKit Agent11 from PM2:"
        pm2 delete livekit-agent11
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|monitor|delete}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the LiveKit agent"
        echo "  stop     - Stop the LiveKit agent"
        echo "  restart  - Restart the LiveKit agent"
        echo "  status   - Show agent status"
        echo "  logs     - Show agent logs"
        echo "  monitor  - Open PM2 monitor"
        echo "  delete   - Remove agent from PM2"
        exit 1
        ;;
esac
