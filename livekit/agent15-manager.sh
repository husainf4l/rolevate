#!/bin/bash

# LiveKit Agent15 Management Script for macOS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
    start)
        echo "🚀 Starting LiveKit Agent15..."
        pm2 start ecosystem-agent15.config.js
        ;;
    stop)
        echo "🛑 Stopping LiveKit Agent15..."
        pm2 stop livekit-agent15
        ;;
    restart)
        echo "🔄 Restarting LiveKit Agent15..."
        pm2 restart livekit-agent15
        ;;
    status)
        echo "📊 LiveKit Agent15 status:"
        pm2 status livekit-agent15
        ;;
    logs)
        echo "📝 Showing LiveKit Agent15 logs:"
        pm2 logs livekit-agent15
        ;;
    logs-error)
        echo "❌ Showing LiveKit Agent15 error logs:"
        pm2 logs livekit-agent15 --err
        ;;
    monitor)
        echo "📈 Opening PM2 monitor:"
        pm2 monit
        ;;
    delete)
        echo "🗑️  Deleting LiveKit Agent15 from PM2:"
        pm2 delete livekit-agent15
        ;;
    reload)
        echo "🔄 Reloading LiveKit Agent15 (zero-downtime):"
        pm2 reload livekit-agent15
        ;;
    health)
        echo "🏥 Checking Agent15 health:"
        source venv/bin/activate
        python agent15/health_check.py
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|logs-error|monitor|delete|reload|health}"
        echo ""
        echo "🎯 LiveKit Agent15 Management Commands:"
        echo "  start      - Start the LiveKit agent15"
        echo "  stop       - Stop the LiveKit agent15"
        echo "  restart    - Restart the LiveKit agent15"
        echo "  status     - Show agent15 status"
        echo "  logs       - Show agent15 logs (all)"
        echo "  logs-error - Show agent15 error logs only"
        echo "  monitor    - Open PM2 monitor"
        echo "  delete     - Remove agent15 from PM2"
        echo "  reload     - Zero-downtime restart"
        echo "  health     - Run health check"
        echo ""
        echo "📝 Examples:"
        echo "  ./agent15-manager.sh start"
        echo "  ./agent15-manager.sh logs"
        echo "  ./agent15-manager.sh status"
        exit 1
        ;;
esac
