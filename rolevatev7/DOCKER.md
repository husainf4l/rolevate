# Docker Setup for Rolevate

## Prerequisites
- Docker installed on your system
- Docker Compose (optional, but recommended)

## Building the Docker Image

### Option 1: Using Docker directly
```bash
docker build -t rolevate:latest .
```

### Option 2: Using Docker Compose
```bash
docker-compose build
```

## Running the Container

### Option 1: Using Docker directly
```bash
docker run -p 3000:3000 rolevate:latest
```

### Option 2: Using Docker Compose
```bash
docker-compose up
```

To run in detached mode:
```bash
docker-compose up -d
```

## Stopping the Container

### Docker Compose
```bash
docker-compose down
```

### Docker
```bash
docker stop <container-id>
```

## Environment Variables

Add your environment variables in the `docker-compose.yml` file or pass them when running the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=your_api_url \
  rolevate:latest
```

## Production Deployment

For production, consider:
1. Using environment-specific `.env` files
2. Setting up proper logging
3. Configuring health checks
4. Using orchestration tools like Kubernetes or Docker Swarm
5. Setting up reverse proxy (nginx/traefik)

## Accessing the Application

Once running, access the application at:
- http://localhost:3000

## Troubleshooting

### Check logs
```bash
docker-compose logs -f web
```

### Rebuild from scratch
```bash
docker-compose build --no-cache
docker-compose up
```

### Access container shell
```bash
docker-compose exec web sh
```
