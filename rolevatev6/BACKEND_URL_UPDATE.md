# Backend URL Configuration Update

## Summary
Updated the application to use the production GraphQL endpoint `https://rolevate.com/api/graphql` in both development and production environments.

## Changes Made

### 1. Apollo Client Configuration
**File:** `/src/lib/apollo.ts`

**Before:**
```typescript
const httpLink = new HttpLink({
  uri: 'http://localhost:4005/graphql',
  credentials: 'include',
});
```

**After:**
```typescript
import { API_CONFIG } from './config';

const httpLink = new HttpLink({
  uri: `${API_CONFIG.API_BASE_URL}/graphql`,
  credentials: 'include',
});
```

### 2. GraphQL Service Configuration
**File:** `/src/services/graphql.service.ts`

**Before:**
```typescript
constructor() {
  // Direct endpoint - pointing to local development server
  this.baseURL = 'http://localhost:4005/graphql';
}
```

**After:**
```typescript
import { API_CONFIG } from '../lib/config';

constructor() {
  // Use the configured API base URL
  this.baseURL = `${API_CONFIG.API_BASE_URL}/graphql`;
}
```

## Configuration Structure

The application uses a centralized configuration system that always points to production:

**File:** `/src/lib/config.ts`
```typescript
// API Configuration - Production URL
const BASE_API_URL = 'https://rolevate.com/api';

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: `${BASE_API_URL}/uploads`,
};
```

## Environment Variables

**No environment variables needed** - The application always uses the production GraphQL endpoint.

## Testing

All files verified with TypeScript compiler:
- ✅ `/src/lib/apollo.ts` - No errors
- ✅ `/src/services/graphql.service.ts` - No errors

## Impact

- **Apollo Client** now uses `https://rolevate.com/api/graphql`
- **GraphQL Service** now uses `https://rolevate.com/api/graphql`
- **All GraphQL operations** (jobs, applications, room, auth) now target production
- **Same endpoint** used in both development and production environments
