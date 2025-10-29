#!/bin/bash
# Health check script for production monitoring

set -e

echo "🏥 Running health checks..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python not found"
    exit 1
fi
echo "✅ Python: $(python --version)"

# Check if virtual environment is active
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Virtual environment not active"
else
    echo "✅ Virtual environment: $VIRTUAL_ENV"
fi

# Check required environment variables
required_vars=(
    "GRAPHQL_ENDPOINT"
    "ROLEVATE_API_KEY"
    "LIVEKIT_URL"
    "LIVEKIT_API_KEY"
    "LIVEKIT_API_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_BUCKET_NAME"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Missing: $var"
        missing_vars=$((missing_vars + 1))
    else
        echo "✅ $var is set"
    fi
done

if [[ $missing_vars -gt 0 ]]; then
    echo "❌ $missing_vars environment variable(s) missing"
    exit 1
fi

# Validate configuration
echo ""
echo "Validating configuration..."
python -c "from config import settings; print('✅ Configuration valid')" || {
    echo "❌ Configuration validation failed"
    exit 1
}

# Check dependencies
echo ""
echo "Checking dependencies..."
pip check || {
    echo "❌ Dependency check failed"
    exit 1
}
echo "✅ All dependencies OK"

echo ""
echo "🎉 All health checks passed!"
exit 0
