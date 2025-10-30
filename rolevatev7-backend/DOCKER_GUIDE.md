# 🐳 Docker Deployment Guide

This guide covers how to deploy the Rolevate backend using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available for containers

## Quick Start

### 1. Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

**⚠️ IMPORTANT:** Never commit the `.env` file to version control!

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Check service health
docker-compose ps
```

### 3. Run Migrations

```bash
# Execute migrations in the running container
docker-compose exec api npm run migration:run

# Or run migrations before starting
docker-compose run --rm api npm run migration:run
```

## Services

The docker-compose setup includes:

- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 for caching (optional)
- **api**: NestJS backend application

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View logs for specific service
docker-compose logs -f postgres
docker-compose logs -f api

# Execute commands in container
docker-compose exec api sh
docker-compose exec postgres psql -U rolevate

# Scale services (if needed)
docker-compose up -d --scale api=3
```

## Production Deployment

### Best Practices

1. **Use Secrets Management**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Docker Secrets (Swarm)

2. **Enable HTTPS**
   - Use reverse proxy (Nginx, Traefik)
   - Obtain SSL certificates (Let's Encrypt)

3. **Database Backups**
   ```bash
   # Backup
   docker-compose exec postgres pg_dump -U rolevate rolevate > backup.sql
   
   # Restore
   docker-compose exec -T postgres psql -U rolevate rolevate < backup.sql
   ```

4. **Resource Limits**
   Add to `docker-compose.yml`:
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
           reservations:
             cpus: '1'
             memory: 1G
   ```

5. **Health Checks**
   Already configured in docker-compose.yml

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Check for port conflicts
lsof -i :4005
lsof -i :5432
```

### Database connection issues

```bash
# Verify database is healthy
docker-compose exec postgres pg_isready -U rolevate

# Check connection from API
docker-compose exec api node -e "console.log(process.env.DATABASE_HOST)"
```

### Reset Everything

```bash
# ⚠️ This will delete all data!
docker-compose down -v
rm -rf postgres_data redis_data
docker-compose up -d
docker-compose exec api npm run migration:run
```

## Development vs Production

### Development
```bash
# Use docker-compose.yml (default)
docker-compose up
```

### Production
```bash
# Use production override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Monitoring

### Logs
```bash
# Follow all logs
docker-compose logs -f

# Export logs
docker-compose logs --no-color > logs.txt
```

### Stats
```bash
# Resource usage
docker stats

# Container info
docker-compose ps
docker inspect rolevate-api
```

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] All credentials rotated from example values
- [ ] JWT_SECRET is at least 32 characters
- [ ] Database password is strong (16+ chars)
- [ ] ALLOWED_ORIGINS configured correctly
- [ ] Running as non-root user (already configured in Dockerfile)
- [ ] Firewall rules configured (only expose necessary ports)
- [ ] TLS/HTTPS enabled for production
- [ ] Regular backups scheduled

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review environment variables
3. Verify all required secrets are set
4. Check database connectivity

