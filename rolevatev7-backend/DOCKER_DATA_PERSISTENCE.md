# Docker Data Persistence Guide

## Current Setup ✅

Your `docker-compose.yml` is **already configured for data persistence**:

### PostgreSQL Volume
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```
- Data Location: `/var/lib/docker/volumes/rolevatev7-backend_postgres_data/_data`
- Persists: Database tables, records, schemas

### Redis Volume
```yaml
volumes:
  - redis_data:/data
```
- Data Location: `/var/lib/docker/volumes/rolevatev7-backend_redis_data/_data`
- Persists: Cache data, job queues

---

## How to Properly Stop & Restart Containers

### ✅ CORRECT WAY (Data is preserved)
```bash
# Stop containers but KEEP volumes
docker compose down

# Data is still there, so restart will load it
docker compose up -d
```

### ❌ WRONG WAY (Data is lost)
```bash
# This DELETES volumes with the -v flag
docker compose down -v

# Now all data is gone! Database is empty
docker compose up -d
```

---

## Verify Data Persistence

### Check volumes exist:
```bash
docker volume ls | grep rolevate
```

### Inspect volume details:
```bash
docker volume inspect rolevatev7-backend_postgres_data
docker volume inspect rolevatev7-backend_redis_data
```

### Check database inside container:
```bash
docker exec rolevate-postgres psql -U postgres -d postgres -c "SELECT datname FROM pg_database WHERE datname='rolevate';"
```

### Clear database (only if needed):
```bash
# WARNING: This will delete all data
docker compose down -v
docker compose up -d
```

---

## Important Notes

1. **Volumes are Docker objects**, not just files
2. **Data persists** even if you stop containers
3. **Data is lost only if** you:
   - Run `docker compose down -v` (the -v flag)
   - Delete Docker volumes manually
   - Remove Docker daemon completely

4. **Container vs Data**:
   - Stopping a container = just pausing the process (data safe)
   - Deleting a container = still safe if volume is there
   - Deleting a volume = data is gone forever

---

## Development Workflow

```bash
# Start development environment
docker compose up -d

# Check status
docker compose ps

# View logs
docker logs rolevate-api

# Stop development (data preserved)
docker compose down

# Later: Restart with data intact
docker compose up -d

# Complete reset (only when needed)
docker compose down -v
docker compose up -d
```

---

## Troubleshooting

### Container restarts losing data?
- This is normal behavior for fresh migrations
- Check if migrations run on startup (see `src/main.ts`)
- Verify database connection in logs: `docker logs rolevate-api`

### Can't connect to database?
```bash
# Check PostgreSQL logs
docker logs rolevate-postgres

# Verify container is healthy
docker compose ps

# Check volume is mounted
docker inspect rolevate-postgres | grep -A 10 Mounts
```

### Want to see what's in the database?
```bash
docker exec -it rolevate-postgres psql -U rolevate -d rolevate
# Then run: \dt (to list tables)
```

