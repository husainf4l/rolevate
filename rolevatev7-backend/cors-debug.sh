#!/bin/bash

# CORS Debug & Setup Script
# Usage: ./cors-debug.sh

set -e

echo "🔍 Rolevate CORS Debugging Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check 1: Backend accessibility
print_status "Checking backend accessibility..."
if curl -s http://localhost:4005/api/graphql > /dev/null 2>&1; then
    print_success "Backend is running on http://localhost:4005"
else
    print_error "Backend is NOT running on http://localhost:4005"
    print_warning "Start backend with: npm run start:dev"
fi
echo ""

# Check 2: CORS headers preflight
print_status "Testing CORS preflight request..."
PREFLIGHT_RESPONSE=$(curl -s -i -X OPTIONS http://localhost:4005/api/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" 2>/dev/null)

if echo "$PREFLIGHT_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    CORS_ORIGIN=$(echo "$PREFLIGHT_RESPONSE" | grep "Access-Control-Allow-Origin" | head -1)
    print_success "CORS preflight successful"
    echo "  Response: $CORS_ORIGIN"
else
    print_error "No CORS headers in response"
    echo "Full response:"
    echo "$PREFLIGHT_RESPONSE"
fi
echo ""

# Check 3: Environment variables
print_status "Checking environment variables..."
if [ -f ".env" ]; then
    print_success ".env file exists"
    
    if grep -q "ALLOWED_ORIGINS" .env; then
        ORIGINS=$(grep "ALLOWED_ORIGINS" .env | cut -d'=' -f2)
        print_success "ALLOWED_ORIGINS is set: $ORIGINS"
    else
        print_error "ALLOWED_ORIGINS not found in .env"
    fi
    
    if grep -q "NODE_ENV=development" .env; then
        print_success "NODE_ENV=development (permissive CORS)"
    elif grep -q "NODE_ENV=production" .env; then
        print_warning "NODE_ENV=production (restrictive CORS)"
    else
        print_warning "NODE_ENV not explicitly set"
    fi
else
    print_error ".env file not found"
fi
echo ""

# Check 4: Docker status
print_status "Checking Docker containers..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q "rolevate-api"; then
        print_success "rolevate-api container is running"
    else
        print_warning "rolevate-api container is NOT running"
        print_warning "Start with: docker-compose up -d"
    fi
    
    if docker ps | grep -q "rolevate-postgres"; then
        print_success "rolevate-postgres container is running"
    else
        print_warning "rolevate-postgres container is NOT running"
    fi
    
    if docker ps | grep -q "rolevate-redis"; then
        print_success "rolevate-redis container is running"
    else
        print_warning "rolevate-redis container is NOT running"
    fi
else
    print_warning "Docker not installed or not in PATH"
fi
echo ""

# Check 5: Port availability
print_status "Checking port availability..."
if lsof -Pi :4005 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Port 4005 is in use (backend running)"
else
    print_error "Port 4005 is NOT in use (backend not running)"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Port 3000 is in use (frontend running)"
else
    print_warning "Port 3000 is NOT in use (frontend not running)"
fi
echo ""

# Check 6: Redis connectivity
print_status "Checking Redis connectivity..."
if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    print_success "Redis is accessible at localhost:6379"
else
    print_warning "Redis is NOT accessible at localhost:6379"
    if command -v docker &> /dev/null && docker ps | grep -q "rolevate-redis"; then
        print_warning "But rolevate-redis container is running. Try: docker exec rolevate-redis redis-cli ping"
    fi
fi
echo ""

# Check 7: PostgreSQL connectivity
print_status "Checking PostgreSQL connectivity..."
if command -v psql &> /dev/null; then
    if psql -h localhost -U $(grep DATABASE_USERNAME .env | cut -d'=' -f2) -d $(grep DATABASE_NAME .env | cut -d'=' -f2) -c "SELECT 1" > /dev/null 2>&1; then
        print_success "PostgreSQL is accessible"
    else
        print_warning "PostgreSQL is NOT directly accessible (may be in Docker)"
    fi
else
    print_warning "psql not installed, skipping PostgreSQL check"
fi
echo ""

# Summary
echo "=================================="
print_status "CORS Debug Summary"
echo ""
echo "Next steps:"
echo "1. Ensure backend is running on port 4005"
echo "2. Ensure frontend is running on port 3000"
echo "3. Check browser DevTools (F12 → Network tab) for CORS errors"
echo "4. Look for 'Access-Control-Allow-Origin' headers in response"
echo ""
echo "For more details, see: CORS_TROUBLESHOOTING.md"
echo ""
