# Services Directory

This directory contains service classes that interact with the GraphQL API.

## Available Services

### 1. `company.service.ts`
Handles all company-related operations including profile management, logo uploads, and team member invitations.

**Usage:**
```typescript
import { companyService } from '@/services/company.service';

// Fetch company profile
const profile = await companyService.getCompanyProfile();

// Upload logo
const logoUrl = await companyService.uploadLogo(file);
```

### 2. `job.service.ts` / `jobs.service.ts`
Handles job listing, creation, and management operations.

### 3. `configuration.ts`
Handles company setup and configuration during onboarding.

### 4. `application.service.ts`
Manages job applications and candidate tracking.

## GraphQL Client

All services use the Apollo Client configured in `/src/lib/apollo.ts`.

### Authentication

The Apollo Client automatically includes the JWT token from localStorage:

```typescript
const token = localStorage.getItem('access_token');
// Automatically included in all requests as Authorization: Bearer <token>
```

### Error Handling

Services throw errors that should be caught by the calling component:

```typescript
try {
  await companyService.uploadLogo(file);
  toast.success('Logo uploaded!');
} catch (error) {
  toast.error(error.message);
}
```

## Creating New Services

1. Import Apollo Client:
```typescript
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';
```

2. Define GraphQL queries/mutations:
```typescript
private MY_QUERY = gql`
  query MyQuery {
    data {
      field
    }
  }
`;
```

3. Create service methods:
```typescript
async fetchData() {
  const { data } = await apolloClient.query({
    query: this.MY_QUERY,
    fetchPolicy: 'network-only',
  });
  return data;
}
```

4. Export singleton instance:
```typescript
export const myService = new MyService();
```

## GraphQL Schema Introspection

To explore available queries and mutations:

```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query": "{ __schema { queryType { fields { name } } } }"}'
```

## Best Practices

1. **Type Safety**: Define TypeScript interfaces for all data structures
2. **Error Handling**: Always catch and handle errors appropriately
3. **Loading States**: Provide loading indicators during async operations
4. **Cache Management**: Use appropriate `fetchPolicy` options
5. **Token Management**: Ensure `access_token` is stored in localStorage

## Common Issues

### Token Not Found
```
Error: No authentication token found
```
**Solution:** Ensure login flow stores token:
```typescript
localStorage.setItem('access_token', token);
```

### GraphQL Errors
```
Error: Cannot query field "xyz" on type "Query"
```
**Solution:** Check if the field exists in the schema using introspection

### Network Errors
```
Error: Failed to fetch
```
**Solution:** Ensure GraphQL server is running at `http://localhost:4005/graphql`
