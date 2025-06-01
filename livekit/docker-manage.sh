#!/bin/bash

# Check if docker-compose or docker compose is available
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo "Error: Neither docker-compose nor docker compose is available."
  echo "Please install Docker and Docker Compose first."
  exit 1
fi

case "$1" in
  build)
    echo "Building Docker image..."
    $DOCKER_COMPOSE build
    ;;
  start)
    echo "Starting LiveKit agent..."
    $DOCKER_COMPOSE up -d
    ;;
  stop)
    echo "Stopping LiveKit agent..."
    $DOCKER_COMPOSE down
    ;;
  logs)
    echo "Showing logs..."
    $DOCKER_COMPOSE logs -f
    ;;
  restart)
    echo "Restarting LiveKit agent..."
    $DOCKER_COMPOSE restart
    ;;
  *)
    echo "Usage: $0 {build|start|stop|logs|restart}"
    exit 1
    ;;
esac

exit 0
