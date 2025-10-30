# CORS Fix Visual Guide

## The Problem

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (http://localhost:3000)                             │
│                                                               │
│  Browser tries to fetch from backend:                        │
│  fetch('http://localhost:4005/api/graphql')                 │
│                                                               │
│  ❌ CORS Error:                                              │
│  "Access-Control-Allow-Origin header missing"               │
└─────────────────────────────────────────────────────────────┘
                           ↓ (Request blocked)
┌─────────────────────────────────────────────────────────────┐
│ Backend (http://localhost:4005)                              │
│                                                               │
│ CORS Configuration Missing:                                  │
│ - ALLOWED_ORIGINS doesn't include http://localhost:3000    │
│ - Only allows: rolevate.com, localhost:3005                 │
└─────────────────────────────────────────────────────────────┘
```

---

## The Solution

```
┌─────────────────────────────────────────────────────────────┐
│ Backend (.env)                                               │
│                                                               │
│ ALLOWED_ORIGINS=                                             │
│   http://localhost:3000,          ← Added for local dev     │
│   http://localhost:3005,          ← Alternative port        │
│   http://host.docker.internal:3000,  ← Docker support       │
│   https://rolevate.com             ← Production             │
└─────────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend (src/main.ts)                                        │
│                                                               │
│ app.enableCors({                                             │
│   origin: corsOriginFn,       ← Allow configured origins     │
│   credentials: true,           ← Allow cookies/auth headers   │
│   allowedHeaders: [            ← Allow Apollo headers        │
│     'Authorization',                                          │
│     'Content-Type',                                           │
│     'apollo-require-preflight'                               │
│   ]                                                           │
│ });                                                           │
└─────────────────────────────────────────────────────────────┘
            ↓ (Request allowed)
┌─────────────────────────────────────────────────────────────┐
│ Frontend receives successful response                         │
│                                                               │
│ Response Headers:                                             │
│ Access-Control-Allow-Origin: http://localhost:3000 ✅       │
│ Access-Control-Allow-Credentials: true ✅                    │
│ Access-Control-Allow-Methods: GET, POST, PUT, ... ✅        │
│                                                               │
│ GraphQL query executes successfully! 🎉                      │
└─────────────────────────────────────────────────────────────┘
```

---

## CORS Request Flow (Preflight + Actual)

```
Browser (Frontend)
        │
        ├─ Step 1: Send PREFLIGHT request (OPTIONS)
        │   Headers:
        │   - Origin: http://localhost:3000
        │   - Access-Control-Request-Method: POST
        │   - Access-Control-Request-Headers: Content-Type, Authorization
        │
        ↓
Backend
        │
        ├─ Check if origin is in ALLOWED_ORIGINS ✓
        │
        ├─ Return 200 OK with CORS headers:
        │   - Access-Control-Allow-Origin: http://localhost:3000
        │   - Access-Control-Allow-Methods: GET, POST, ...
        │   - Access-Control-Allow-Headers: Content-Type, Authorization, ...
        │   - Access-Control-Allow-Credentials: true
        │
        ↓
Browser
        │
        ├─ Step 2: PREFLIGHT OK, send actual request
        │   POST /api/graphql
        │   Body: { query: "...", variables: {...} }
        │   Headers:
        │   - Authorization: Bearer token
        │   - Content-Type: application/json
        │
        ↓
Backend
        │
        ├─ Process GraphQL query
        ├─ Return data
        │
        ↓
Browser
        │
        └─ ✅ Query successful, update UI
```

---

## Development vs Production

### Development Mode
```
ALLOWED_ORIGINS: (can include http://, multiple ports)
NODE_ENV: development

Backend CORS Behavior:
┌────────────────────────────────────────┐
│ corsOriginFn = true                    │
│ (Allow ALL origins - for testing)      │
└────────────────────────────────────────┘

✅ Faster development
✅ No need to reconfigure for each port
✅ Easier debugging
⚠️ NEVER use in production!
```

### Production Mode
```
ALLOWED_ORIGINS: https://rolevate.com,https://www.rolevate.com
NODE_ENV: production

Backend CORS Behavior:
┌────────────────────────────────────────┐
│ corsOriginFn = [configured origins]    │
│ (Allow ONLY specified origins)         │
└────────────────────────────────────────┘

✅ Secure - only known origins allowed
✅ Prevents CSRF attacks
✅ Production ready
⚠️ Must be correctly configured!
```

---

## Docker Networking

### Local Development (No Docker)
```
Your Machine:
┌─────────────┐        ┌─────────────┐
│  Frontend   │ ←---→  │   Backend   │
│ :3000       │        │   :4005     │
└─────────────┘        └─────────────┘

Frontend URL: http://localhost:3000
Backend URL: http://localhost:4005
```

### Docker Development (Frontend in Container)
```
Your Machine:
┌─────────────────────────────────────────┐
│         Docker Container Network        │
│  ┌─────────────┐      ┌─────────────┐  │
│  │  Frontend   │ ←──→ │  PostgreSQL │  │
│  │  :3000      │      │   :5432     │  │
│  └─────────────┘      └─────────────┘  │
│                                         │
│  Access from Host Machine:              │
│  ↓                                      │
│  http://host.docker.internal:3000 ◄───┘
└─────────────────────────────────────────┘
        ↕
┌─────────────┐
│  Backend    │
│  :4005      │
└─────────────┘

Frontend URL: http://localhost:3000 (inside container)
Frontend URL: http://host.docker.internal:3000 (from host)
Backend URL: http://localhost:4005 (from host)
Backend URL: http://host.docker.internal:4005 (from container)
```

---

## Environment Variables Checklist

### Backend .env
```
✅ ALLOWED_ORIGINS=http://localhost:3000,http://host.docker.internal:3000,...
✅ NODE_ENV=development (for local development)
✅ NODE_ENV=production (for deployment)
✅ PORT=4005
✅ DATABASE_HOST=postgres (or localhost)
✅ REDIS_HOST=redis (or localhost)
```

### Frontend .env.local
```
✅ VITE_GRAPHQL_URL=http://localhost:4005/api/graphql
   (or http://host.docker.internal:4005/api/graphql for Docker)
✅ VITE_API_URL=http://localhost:4005
   (or http://host.docker.internal:4005 for Docker)
```

---

## Quick Troubleshooting Tree

```
CORS Error?
│
├─ "No Access-Control-Allow-Origin header"
│  └─ Frontend origin not in backend ALLOWED_ORIGINS
│     → Add to .env: ALLOWED_ORIGINS=...,http://localhost:3000
│
├─ "Credentials not allowed"
│  └─ Backend not configured for credentials
│     → Check: credentials: true in CORS config ✓ (already done)
│
├─ "Authorization header not allowed"
│  └─ Header not in allowedHeaders
│     → Check: allowedHeaders includes 'Authorization' ✓ (already done)
│
├─ "Works locally but not in Docker"
│  └─ Frontend in Docker can't reach backend
│     → Use: http://host.docker.internal:4005 for frontend
│     → Add to ALLOWED_ORIGINS: http://host.docker.internal:3000
│
├─ "401 Unauthorized after preflight OK"
│  └─ JWT token missing or expired
│     → Check browser storage: localStorage.getItem('auth_token')
│     → Check Apollo client sends Authorization header
│     → Check token hasn't expired
│
└─ Still not working?
   → Run: ./cors-debug.sh
   → Check: CORS_TROUBLESHOOTING.md
   → Logs: npm run start:dev (backend) + F12 (frontend)
```

---

## Files Changed (Visual Summary)

```
🔧 Modified:
├─ .env
│  └─ ALLOWED_ORIGINS: added localhost:3000, host.docker.internal:3000
│
├─ src/main.ts
│  ├─ Enhanced CORS configuration
│  ├─ Added environment-aware origin handling
│  └─ Added logging for debugging
│
└─ docker-compose.yml
   ├─ NODE_ENV: ${NODE_ENV:-development}
   ├─ REDIS_HOST: redis (Docker service name)
   └─ REDIS configuration variables

📄 Created:
├─ CORS_TROUBLESHOOTING.md
│  └─ Comprehensive CORS debugging guide
│
├─ FRONTEND_APOLLO_CONFIG.md
│  └─ Apollo client configuration examples
│
├─ cors-debug.sh
│  └─ Automated debugging script
│
├─ CORS_FIX_SUMMARY.md
│  └─ Implementation summary (this would be here)
│
└─ CORS_FIX_VISUAL_GUIDE.md
   └─ Visual explanations (this file)
```

---

## Success Checklist

After applying the fix:

```
□ Backend updated (.env with correct ALLOWED_ORIGINS)
□ Backend CORS config updated (src/main.ts)
□ Backend started: npm run start:dev
□ Frontend can access: http://localhost:3000
□ Frontend DevTools show GraphQL requests (no CORS errors)
□ Response headers include: Access-Control-Allow-Origin ✓
□ GraphQL queries execute successfully
□ Authentication works (JWT token sent properly)
□ For Docker: host.docker.internal:3000 also works
□ ./cors-debug.sh shows all green ✓
□ Ready for production deployment
```

---

## Common Port References

```
Frontend:
  Development: http://localhost:3000
  Docker on macOS/Windows: http://host.docker.internal:3000
  Docker on Linux: http://172.17.0.1:3000

Backend:
  Development: http://localhost:4005
  Docker on macOS/Windows: http://host.docker.internal:4005
  Docker on Linux: http://172.17.0.1:4005

Database:
  Local: localhost:5432
  Docker: postgres:5432 (internal)

Redis:
  Local: localhost:6379
  Docker: redis:6379 (internal)

LiveKit:
  Configuration: LIVEKIT_URL (from .env)

GraphQL Endpoint:
  Backend: http://localhost:4005/api/graphql
  Docker: http://host.docker.internal:4005/api/graphql
```

---

**Status**: ✅ CORS Issues Resolved  
**Last Updated**: October 30, 2025  
**Visual Guide**: Complete

