# CORS Configuration Troubleshooting Guide

## Issue Summary
CORS (Cross-Origin Resource Sharing) errors occur when your frontend cannot communicate with the backend due to security restrictions.

**Error Symptoms**:
```
Access to XMLHttpRequest at 'http://host.docker.internal:4005/api/graphql' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

---

## Root Causes

### 1. **Allowed Origins Mismatch** ⚠️ (MOST COMMON)
- Backend's `ALLOWED_ORIGINS` doesn't include the frontend's origin
- Frontend origin: `http://localhost:3000`
- Backend only allows: `https://rolevate.com, http://rolevate.com`

### 2. **Docker Networking Issues**
- Frontend in Docker can't resolve backend address
- `localhost` inside Docker doesn't map to host machine
- Need to use `host.docker.internal` (macOS/Windows) or `172.17.0.1` (Linux)

### 3. **Credentials Not Allowed**
- Frontend sends `credentials: 'include'`
- Backend doesn't allow `credentials: true`
- Backend doesn't allow the specific origin

### 4. **Missing Headers**
- Backend doesn't expose required headers for Apollo client
- Apollo client requests specific headers that aren't allowed

---

## Solution

### Step 1: Update Backend Configuration

**File**: `.env`
```bash
# Allow all local development origins
ALLOWED_ORIGINS=https://rolevate.com,http://rolevate.com,http://localhost:3000,http://localhost:3005,http://host.docker.internal:3000,http://127.0.0.1:3000
NODE_ENV=development
```

**Explanation of origins**:
- `http://localhost:3000` - Local browser development
- `http://localhost:3005` - Alternative local port
- `http://host.docker.internal:3000` - Docker container accessing host (macOS/Windows)
- `http://127.0.0.1:3000` - Localhost IP version

### Step 2: Backend CORS Setup

**File**: `src/main.ts`

The backend now automatically:
1. **Development mode** (`NODE_ENV=development`): Allows ALL origins
2. **Production mode**: Restricts to `ALLOWED_ORIGINS` from `.env`

```typescript
// For development, optionally allow all origins
const corsOriginFn = process.env.NODE_ENV === 'development' 
  ? true // Allow all origins in development
  : allowedOrigins; // Restrict in production

app.enableCors({
  origin: corsOriginFn,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-request-id', 'apollo-require-preflight'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'x-request-id'],
  maxAge: 86400,
  optionsSuccessStatus: 200,
  preflightContinue: false,
});
```

### Step 3: Ensure Docker Network Configuration

**File**: `docker-compose.yml`

Key settings:
- `NODE_ENV: ${NODE_ENV:-development}` - Defaults to development (permissive)
- `REDIS_HOST: redis` - Uses Docker internal service name
- `DATABASE_HOST: postgres` - Uses Docker internal service name
- `ALLOWED_ORIGINS` variable properly passed through

---

## Testing & Verification

### Test 1: Check CORS Headers in Browser DevTools

1. Open frontend in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Look for GraphQL request (any failed request)
5. Click on request, go to Response Headers
6. Look for:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   ```

### Test 2: Test Backend Directly

```bash
# From backend container or local machine
curl -X OPTIONS http://localhost:4005/api/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected response headers:
```
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Test 3: Backend Logs

When backend starts, look for:
```
✅ CORS allowed origins: https://rolevate.com, http://rolevate.com, http://localhost:3000, ...
🚀 Application is running on: http://0.0.0.0:4005
📊 GraphQL Playground: http://0.0.0.0:4005/api/graphql
🏥 Environment: development
```

---

## Docker-Specific Setup

### macOS / Windows with Docker Desktop

Frontend in Docker can reach backend on host using:
- Backend URL: `http://host.docker.internal:4005`
- Redis URL: `redis` (internal Docker service)
- Database URL: `postgres` (internal Docker service)

### Linux with Docker

Use host network driver or IP address:
- Backend URL: `http://172.17.0.1:4005` (or host IP)
- Get host IP: `hostname -I`

### docker-compose.yml Network

```yaml
networks:
  rolevate-network:
    driver: bridge

services:
  api:
    networks:
      - rolevate-network
```

Services communicate internally using service names (`postgres`, `redis`, `api`).
Host machine accesses via `localhost` or `host.docker.internal`.

---

## Production Deployment

### IMPORTANT: Change NODE_ENV to production

In production, **ALWAYS**:

```bash
# .env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://rolevate.com,https://www.rolevate.com,https://dashboard.rolevate.com
```

Backend will **only** allow specified origins (not all origins).

---

## Common Error Scenarios

### Scenario 1: "No 'Access-Control-Allow-Origin' header"

**Cause**: Origin not in `ALLOWED_ORIGINS`

**Fix**:
```bash
# Add to .env
ALLOWED_ORIGINS=http://localhost:3000,http://host.docker.internal:3000
```

### Scenario 2: "Credentials mode is 'include' but Access-Control-Allow-Credentials is not 'true'"

**Cause**: Backend doesn't allow credentials

**Fix**: Ensure `credentials: true` in CORS config (already set)

### Scenario 3: "Request header 'authorization' is not allowed"

**Cause**: Backend doesn't expose Authorization header

**Fix**: Already included in `allowedHeaders`:
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-request-id', 'apollo-require-preflight']
```

### Scenario 4: Works locally but not in Docker

**Cause**: Container can't reach backend

**Fix**: 
- Use service name (`rolevate-api:4005`) for Docker-to-Docker communication
- Use `host.docker.internal:4005` from browser inside Docker
- Check `ALLOWED_ORIGINS` includes the origin

---

## Quick Checklist

- [ ] `.env` file has correct `ALLOWED_ORIGINS`
- [ ] `.env` has `NODE_ENV=development` (for development)
- [ ] `src/main.ts` has updated CORS config with credentials
- [ ] Backend is running on correct port (4005)
- [ ] Frontend is running on correct port (3000)
- [ ] Docker network is properly configured
- [ ] Redis and PostgreSQL services are running (if using Docker)
- [ ] Browser DevTools shows correct CORS headers in response
- [ ] Frontend Apollo client sends `credentials: 'include'`

---

## Debugging Commands

```bash
# Check if backend is accessible
curl http://localhost:4005/api/graphql -v

# Check CORS preflight
curl -X OPTIONS http://localhost:4005/api/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

# Check Docker container logs
docker logs rolevate-api

# Check if port is open
lsof -i :4005  # macOS/Linux
netstat -ano | findstr :4005  # Windows

# Test from inside Docker container
docker exec rolevate-api curl http://localhost:4005/api/graphql
```

---

## References

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS CORS Configuration](https://docs.nestjs.com/security/cors)
- [Fastify CORS Plugin](https://github.com/fastify/fastify-cors)
- [Apollo Client CORS](https://www.apollographql.com/docs/apollo-server/security/cors/)

---

**Last Updated**: October 30, 2025  
**Status**: ✅ CORS Configuration Fixed
