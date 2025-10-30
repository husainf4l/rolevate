#!/bin/bash

##############################################################################
# Docker-based Security Test Runner
#
# This script runs the security tests inside a container to ensure
# consistent environment and easy CI/CD integration
#
# Usage: ./test-in-docker.sh [--api-url URL]
##############################################################################

set -e

# Configuration
API_URL="${API_URL:-http://host.docker.internal:3000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
SYSTEM_TOKEN="${SYSTEM_TOKEN:-}"
TEST_TYPE="${TEST_TYPE:-node}"  # 'bash' or 'node'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ Info: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

show_usage() {
    cat << EOF
${BLUE}Docker-based Security Test Runner${NC}

${YELLOW}Usage:${NC}
  $0 [OPTIONS]

${YELLOW}OPTIONS:${NC}
  --api-url URL         GraphQL API URL (default: http://host.docker.internal:3000)
  --test-type TYPE      Test type: 'node' or 'bash' (default: node)
  --admin-token TOKEN   ADMIN JWT token
  --system-token TOKEN  SYSTEM JWT token
  --help                Show this help message

${YELLOW}Environment Variables:${NC}
  API_URL               GraphQL API URL
  ADMIN_TOKEN           ADMIN JWT token
  SYSTEM_TOKEN          SYSTEM JWT token
  TEST_TYPE             'node' or 'bash'

${YELLOW}Examples:${NC}
  # Run with default settings (assumes API on host machine)
  $0

  # Run with custom API URL
  $0 --api-url http://backend:3000

  # Run with ADMIN token
  ADMIN_TOKEN="your-token" $0

  # Run bash tests
  $0 --test-type bash

${YELLOW}Note:${NC}
  If running API on host machine, use 'host.docker.internal' in the URL.
  If running API in Docker, use the service name (e.g., 'backend:3000').

EOF
}

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --admin-token)
            ADMIN_TOKEN="$2"
            shift 2
            ;;
        --system-token)
            SYSTEM_TOKEN="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

print_header "Docker Security Test Runner"

print_info "API URL: ${API_URL}"
print_info "Test Type: ${TEST_TYPE}"
print_info "Admin Token: ${ADMIN_TOKEN:+set}${ADMIN_TOKEN:-not set}"
print_info "System Token: ${SYSTEM_TOKEN:+set}${SYSTEM_TOKEN:-not set}"

# Create Dockerfile for testing
DOCKERFILE_CONTENT=$(cat << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install bash and curl for the bash test script
RUN apk add --no-cache bash curl

# Copy test scripts
COPY test-user-security.js .
COPY test-user-security.sh .

# Make bash script executable
RUN chmod +x test-user-security.sh

# Default command
CMD ["node", "test-user-security.js"]
EOF
)

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_success "Docker is running"

# Create temporary dockerfile
TEMP_DIR=$(mktemp -d)
echo "$DOCKERFILE_CONTENT" > "${TEMP_DIR}/Dockerfile"

print_info "Building Docker image for testing..."

# Build Docker image
if docker build -t rolevate-security-tests:latest "${TEMP_DIR}" > /dev/null 2>&1; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

print_info "Running tests in Docker container..."

# Determine command based on test type
if [ "$TEST_TYPE" = "bash" ]; then
    TEST_CMD="./test-user-security.sh"
else
    TEST_CMD="node test-user-security.js"
fi

# Build environment variables for Docker
ENV_VARS=""
[ -n "$ADMIN_TOKEN" ] && ENV_VARS="$ENV_VARS -e ADMIN_TOKEN=$ADMIN_TOKEN"
[ -n "$SYSTEM_TOKEN" ] && ENV_VARS="$ENV_VARS -e SYSTEM_TOKEN=$SYSTEM_TOKEN"

# Run tests in container
print_header "Test Output"

# shellcheck disable=SC2086
docker run --rm \
    -v "$(pwd)/test-results:/app/test-results" \
    -e API_URL="${API_URL}" \
    $ENV_VARS \
    rolevate-security-tests:latest \
    sh -c "$TEST_CMD --url '$API_URL'"

TEST_EXIT_CODE=$?

# Cleanup
rm -rf "${TEMP_DIR}"

print_header "Results"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed!"
    print_success "Results saved to: test-results/"
else
    print_error "Some tests failed"
    print_info "Check test-results/ for detailed logs"
fi

echo ""
exit $TEST_EXIT_CODE
