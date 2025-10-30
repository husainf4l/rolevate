# Frontend Apollo Client Configuration

## Issue: Frontend Cannot Connect to Backend

If your frontend is getting CORS errors or cannot reach the backend GraphQL API, follow this guide.

---

## Frontend Environment Setup

### .env.local (Frontend)

```bash
# Development - Local Backend
VITE_GRAPHQL_URL=http://localhost:4005/api/graphql
VITE_API_URL=http://localhost:4005

# For Docker development
# VITE_GRAPHQL_URL=http://host.docker.internal:4005/api/graphql
# VITE_API_URL=http://host.docker.internal:4005

# Production
# VITE_GRAPHQL_URL=https://api.rolevate.com/api/graphql
# VITE_API_URL=https://api.rolevate.com
```

---

## Apollo Client Configuration

### apollo.ts / apollo.client.ts

Ensure your Apollo client is configured to:
1. ✅ Send credentials (cookies, authorization tokens)
2. ✅ Use the correct backend URL
3. ✅ Handle authentication headers
4. ✅ Include proper error handling

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Get backend URL from environment
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4005/api/graphql';

console.log('🚀 Apollo Client connecting to:', GRAPHQL_URL);

// HTTP Link with credentials support
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include', // ✅ IMPORTANT: Send cookies & auth headers
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow cross-origin requests with credentials
  fetchOptions: {
    mode: 'cors',
  },
});

// Error link for debugging
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network error]:`, networkError);
    
    // Check if it's a CORS error
    if (networkError.message?.includes('401') || networkError.message?.includes('403')) {
      console.error('❌ Unauthorized - Check authentication token');
    }
  }
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
```

---

## React / Vue Integration

### React (with useQuery)

```typescript
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

const MY_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
    }
  }
`;

function MyComponent() {
  const { data, loading, error } = useQuery(MY_QUERY, {
    variables: { id: '123' },
    fetchPolicy: 'cache-and-network', // Fetch fresh data and cache
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Query error:', error.message);
    return <p>Error: {error.message}</p>;
  }

  return <div>{data?.user?.name}</div>;
}
```

### Vue 3 (with useQuery)

```vue
<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const MY_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
    }
  }
`;

const { result, loading, error } = useQuery(MY_QUERY, { id: '123' });
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-if="error">Error: {{ error.message }}</div>
  <div v-if="result?.user">{{ result.user.name }}</div>
</template>
```

---

## Authentication with Apollo Client

### Sending JWT Token in Headers

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: 'http://localhost:4005/api/graphql',
  credentials: 'include',
});

// Auth link to add JWT token
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage or cookie
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

---

## Docker Development Setup

### Frontend in Docker → Backend on Host

```typescript
// For development with Docker
let graphqlUrl = 'http://localhost:4005/api/graphql';

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // If frontend is in Docker, use host.docker.internal
  if (window.location.hostname === 'frontend' || window.location.hostname.includes('docker')) {
    graphqlUrl = 'http://host.docker.internal:4005/api/graphql';
  }
}

const httpLink = new HttpLink({
  uri: graphqlUrl,
  credentials: 'include',
});
```

---

## Debugging CORS Issues

### 1. Check Browser Console
Open DevTools (F12) and look for errors:
```
Access to XMLHttpRequest at 'http://localhost:4005/api/graphql' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Make a GraphQL request
3. Click on the request
4. Check Response Headers:
   - Should see: `Access-Control-Allow-Origin: http://localhost:3000`
   - Should see: `Access-Control-Allow-Credentials: true`

### 3. Test CORS Manually

```bash
# Test preflight request
curl -X OPTIONS http://localhost:4005/api/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

### 4. Backend Logs
Check backend logs for:
```
✅ CORS allowed origins: http://localhost:3000, http://host.docker.internal:3000, ...
🚀 Application is running on: http://0.0.0.0:4005
```

---

## Common Frontend Errors & Solutions

### Error 1: "Failed to fetch - CORS error"

**Cause**: Backend not allowing the frontend origin

**Fix**: Backend `.env` should include:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://host.docker.internal:3000
```

### Error 2: "401 Unauthorized"

**Cause**: JWT token not sent or expired

**Fix**: 
1. Check token in localStorage: `localStorage.getItem('auth_token')`
2. Ensure auth link sends token in headers
3. Check token expiry: `jwt_decode(token).exp`

### Error 3: "Network error - Unexpected token"

**Cause**: Backend not returning valid JSON

**Fix**:
1. Check backend is running: `curl http://localhost:4005/api/graphql`
2. Check for backend errors: `docker logs rolevate-api`
3. Verify GraphQL endpoint: `/api/graphql` (not `/graphql`)

### Error 4: "Mixed Content: The page was loaded over HTTPS..."

**Cause**: Frontend HTTPS → Backend HTTP (insecure)

**Fix**: Use HTTPS for both in production, or allow HTTP in development

---

## Environment Variables Checklist

Frontend `.env.local`:
- [ ] `VITE_GRAPHQL_URL` set to backend URL
- [ ] URL includes `/api/graphql` path
- [ ] For Docker: use `host.docker.internal`

Backend `.env`:
- [ ] `ALLOWED_ORIGINS` includes frontend origin
- [ ] `NODE_ENV=development` for permissive CORS
- [ ] `ALLOWED_ORIGINS` trimmed of whitespace

---

## Testing the Full Flow

### Step 1: Start Backend
```bash
cd /Users/husain/Desktop/rolevate/rolevatev7-backend
npm run start:dev
# Should see: 🚀 Application is running on: http://0.0.0.0:4005
```

### Step 2: Start Frontend
```bash
cd /Users/husain/Desktop/rolevate/rolevatev7-frontend
npm run dev
# Should see: ➜  Local: http://localhost:3000
```

### Step 3: Test Connection
```bash
# From terminal
curl http://localhost:4005/api/graphql -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see 200 OK with CORS headers
```

### Step 4: Check Frontend Logs
1. Open frontend in browser: `http://localhost:3000`
2. Open DevTools Console (F12)
3. Should see: `🚀 Apollo Client connecting to: http://localhost:4005/api/graphql`
4. Make a GraphQL query
5. Check Network tab for response

---

## Production Deployment

### Frontend

```bash
# .env.production
VITE_GRAPHQL_URL=https://api.rolevate.com/api/graphql
VITE_API_URL=https://api.rolevate.com
```

Build and deploy:
```bash
npm run build
npm run preview  # Test production build locally
```

### Backend

```bash
# .env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://rolevate.com,https://www.rolevate.com,https://dashboard.rolevate.com
DATABASE_HOST=prod-postgres.example.com
LIVEKIT_URL=wss://livekit.rolevate.com
# ... other production settings
```

---

## Useful Commands

```bash
# Test backend GraphQL endpoint
curl http://localhost:4005/api/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Check if backend is responding
curl -i http://localhost:4005/api/graphql

# Clear Apollo Cache (React DevTools)
localStorage.removeItem('apollo-cache-persist')

# View network requests in real-time
npm run dev -- --host  # Expose to network

# Test with insecure HTTPS in development
NODE_TLS_REJECT_UNAUTHORIZED='0' npm run dev
```

---

## References

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fastify CORS Plugin](https://github.com/fastify/fastify-cors)
- [Docker host.docker.internal](https://docs.docker.com/desktop/networking/)

---

**Last Updated**: October 30, 2025  
**Status**: ✅ Complete
