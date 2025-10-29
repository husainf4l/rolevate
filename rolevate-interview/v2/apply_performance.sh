#!/bin/bash

# Performance Optimization Script
# Applies recommended performance settings to .env file

echo "🚀 Applying Performance Optimizations..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.example first"
    exit 1
fi

# Create backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backed up .env file"

# Function to update or add env variable
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i.tmp "s|^${key}=.*|${key}=${value}|g" .env
        rm -f .env.tmp
        echo "  ↻ Updated ${key}=${value}"
    else
        # Add new
        echo "${key}=${value}" >> .env
        echo "  + Added ${key}=${value}"
    fi
}

# Apply performance optimizations
echo ""
echo "📝 Applying settings..."

# Logging
update_env "LOG_LEVEL" "WARNING"

# Performance tuning
update_env "MIN_ENDPOINTING_DELAY" "0.5"
update_env "INTERRUPTION_THRESHOLD" "0.8"
update_env "ENABLE_INTERRUPTIONS" "true"

# HTTP optimization
update_env "HTTP_TIMEOUT" "15"
update_env "HTTP_MAX_CONNECTIONS" "50"

# Retry optimization
update_env "MAX_RETRIES" "2"
update_env "RETRY_MIN_WAIT" "1"
update_env "RETRY_MAX_WAIT" "5"

echo ""
echo "✅ Performance optimizations applied!"
echo ""
echo "Key changes:"
echo "  • Reduced verbose logging (WARNING level)"
echo "  • Optimized interruption detection (0.5s delay)"
echo "  • Faster HTTP timeouts (15s)"
echo "  • Reduced retry attempts (2 max)"
echo ""
echo "To test the changes:"
echo "  source .venv/bin/activate"
echo "  python agent.py dev"
echo ""
echo "To restore previous settings:"
echo "  mv .env.backup.* .env"
