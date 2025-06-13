#!/bin/bash

# LiveKit Agent Management Script

AGENT_DIR="/home/husain/rolevate/livekit"
PIDFILE="$AGENT_DIR/agent.pid"

case "$1" in
    start)
        echo "Starting LiveKit Agent..."
        cd "$AGENT_DIR"
        ./monitor_agent.sh
        echo "Agent started. Check status with: $0 status"
        ;;
    stop)
        echo "Stopping LiveKit Agent..."
        if [ -f "$PIDFILE" ]; then
            PID=$(cat "$PIDFILE")
            kill "$PID" 2>/dev/null
            rm -f "$PIDFILE"
            echo "Agent stopped."
        else
            echo "No PID file found. Killing any python agent processes..."
            pkill -f "python agent.py"
        fi
        ;;
    restart)
        echo "Restarting LiveKit Agent..."
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f "$PIDFILE" ]; then
            PID=$(cat "$PIDFILE")
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "Agent is running (PID: $PID)"
                echo "Port status:"
                lsof -i :8007 2>/dev/null || echo "Port 8007 not in use"
            else
                echo "Agent is not running (stale PID file)"
                rm -f "$PIDFILE"
            fi
        else
            echo "Agent is not running"
        fi
        ;;
    logs)
        echo "=== Recent Agent Output ==="
        tail -20 "$AGENT_DIR/agent_output.log" 2>/dev/null || echo "No output log found"
        echo ""
        echo "=== Monitor Log ==="
        tail -10 "$AGENT_DIR/monitor.log" 2>/dev/null || echo "No monitor log found"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "  start   - Start the LiveKit agent"
        echo "  stop    - Stop the LiveKit agent"
        echo "  restart - Restart the LiveKit agent"
        echo "  status  - Show agent status"
        echo "  logs    - Show recent logs"
        exit 1
        ;;
esac
