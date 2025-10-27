#!# Rolevate Agent Web Controller Startup Script
# Usage: ./start_controller.sh [port]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
PORT=${1:-8004}olevate Agent Web Controller Startup Script
# Usage: ./start_controller.sh [port]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
PORT=${1:-8080}

# Project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Rolevate Agent Web Controller Launcher      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if venv exists
if [ ! -d "$PROJECT_DIR/venv" ]; then
    echo -e "${RED}✗ Virtual environment not found!${NC}"
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}⚙ Activating virtual environment...${NC}"
source "$PROJECT_DIR/venv/bin/activate"

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Dependencies not installed${NC}"
    echo -e "${BLUE}⚙ Installing requirements...${NC}"
    pip install -r "$PROJECT_DIR/requirements.txt"
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check .env file
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}  Please create .env file with required configuration${NC}"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Create static directory if it doesn't exist
mkdir -p "$PROJECT_DIR/static"

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}✗ Port $PORT is already in use!${NC}"
    echo -e "${YELLOW}  Please choose a different port or stop the process using this port${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All checks passed${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Starting Web Controller...           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎛️  Dashboard:${NC}      http://localhost:$PORT"
echo -e "${GREEN}📚 API Docs:${NC}       http://localhost:$PORT/docs"
echo -e "${GREEN}🔍 Health Check:${NC}   http://localhost:$PORT/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the web controller
cd "$PROJECT_DIR"
exec python web_controller.py
