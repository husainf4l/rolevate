# User Endpoint Security - Debugging & Verification Guide

## Issue Identified
A CANDIDATE user (userType: CANDIDATE) was able to access the `users` query which should only be accessible to ADMIN or SYSTEM users.

## Root Cause Analysis
The `RolesGuard` wasn't properly configured in the module providers, which could cause the guard to not be instantiated or injected correctly.

## Fixes Applied

### 1. Enhanced RolesGuard (src/auth/roles.guard.ts)
**Changes:**
- Added `ForbiddenException` import for clearer error handling
- Added explicit error messages for debugging
- Improved validation with explicit checks for `userType` existence
- Now throws `ForbiddenException` with detailed messages instead of silently returning false

**Before:**
```typescript
return requiredRoles.some((role) => user.userType === role);
```

**After:**
```typescript
const hasRequiredRole = requiredRoles.some((role) => user.userType === role);

if (!hasRequiredRole) {
  throw new ForbiddenException(
    `Access denied. Required roles: ${requiredRoles.join(', ')}. User role: ${user.userType}`
  );
}

return true;
```

### 2. Fixed Module Configuration (src/user/user.module.ts)
**Changes:**
- Added `RolesGuard` to module imports
- Registered `RolesGuard` in the providers array

**Before:**
```typescript
providers: [UserService, UserResolver, ApiKeyService, ApiKeyResolver, AuditService, JwtAuthGuard],
```

**After:**
```typescript
providers: [UserService, UserResolver, ApiKeyService, ApiKeyResolver, AuditService, JwtAuthGuard, RolesGuard],
```

## Testing the Fix

### Test Case 1: CANDIDATE User Should NOT Access `users` Query

**Token Details:**
```
userType: CANDIDATE
sub: b33e0f2a-8679-4403-bcc7-183fdbc8b535
```

**GraphQL Query:**
```graphql
query {
  users {
    id
    email
    name
    userType
  }
}
```

**Expected Result:**
```json
{
  "errors": [
    {
      "message": "Access denied. Required roles: ADMIN, SYSTEM. User role: CANDIDATE",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

**Status:** ✅ Should now be blocked

---

### Test Case 2: ADMIN User SHOULD Access `users` Query

**Token Details:**
```
userType: ADMIN
```

**GraphQL Query:**
```graphql
query {
  users {
    id
    email
    name
    userType
  }
}
```

**Expected Result:**
```json
{
  "data": {
    "users": [
      {
        "id": "...",
        "email": "...",
        "name": "...",
        "userType": "..."
      }
      // ... more users
    ]
  }
}
```

**Status:** ✅ Should work

---

### Test Case 3: SYSTEM User SHOULD Access `users` Query

**Token Details:**
```
userType: SYSTEM
```

**Expected Result:** ✅ Should work

---

### Test Case 4: CANDIDATE User CAN Access `me` Query

**Query:**
```graphql
query {
  me {
    id
    email
    name
    userType
  }
}
```

**Expected Result:** ✅ Should work (no role restrictions on this endpoint)

---

### Test Case 5: CANDIDATE User CAN Access `changePassword` Mutation

**Mutation:**
```graphql
mutation {
  changePassword(input: {
    currentPassword: "oldPassword"
    newPassword: "newPassword"
  })
}
```

**Expected Result:** ✅ Should work (no role restrictions on this endpoint)

---

## Endpoints Protected Summary

| Endpoint | Query/Mutation | Required Roles | Status |
|----------|---|---|---|
| `users` | Query | ADMIN, SYSTEM | ✅ Protected |
| `user(id)` | Query | ADMIN, SYSTEM | ✅ Protected |
| `createUser` | Mutation | ADMIN, SYSTEM | ✅ Protected |
| `updateUser` | Mutation | ADMIN, SYSTEM | ✅ Protected |
| `me` | Query | None (any auth user) | ✅ Not Protected |
| `changePassword` | Mutation | None (any auth user) | ✅ Not Protected |

## How the Guard Works

### Execution Flow
1. Request arrives at protected endpoint (e.g., `users` query)
2. `JwtAuthGuard` executes:
   - Extracts JWT token from Authorization header or cookies
   - Verifies token signature and expiration
   - Fetches user from database using `sub` (subject) claim
   - Sets `request.user` with the full user object
3. `RolesGuard` executes:
   - Retrieves required roles from `@Roles()` decorator
   - Gets user from `request.user` (set by JwtAuthGuard)
   - Compares `user.userType` with required roles
   - Throws `ForbiddenException` if role doesn't match
4. If both guards pass, resolver executes
5. If any guard fails, GraphQL error is returned

### Guard Order
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN, UserType.SYSTEM)
```

The order matters:
1. `JwtAuthGuard` runs first (must authenticate)
2. `RolesGuard` runs second (must authorize)

## Verification Checklist

- [ ] No TypeScript compilation errors
- [ ] `RolesGuard` is provided in `UserModule`
- [ ] `JwtAuthGuard` properly sets `request.user`
- [ ] `@Roles()` decorator is applied to protected endpoints
- [ ] `@UseGuards(JwtAuthGuard, RolesGuard)` is applied to protected endpoints
- [ ] CANDIDATE users are blocked with ForbiddenException
- [ ] ADMIN/SYSTEM users can access protected endpoints
- [ ] `me` query works for all authenticated users
- [ ] `changePassword` mutation works for all authenticated users

## Database Query for Testing

If you want to verify user types in your database:

```sql
SELECT id, email, name, "userType", "isActive", "createdAt"
FROM "user"
ORDER BY "createdAt" DESC
LIMIT 10;
```

## Troubleshooting

### Issue: CANDIDATE still can access `users` query

**Possible Causes:**
1. Server hasn't been restarted with new code
2. TypeScript compilation failed silently
3. Guard is not properly registered
4. User object doesn't have `userType` property

**Solutions:**
```bash
# Restart the server
npm run start

# Or with Docker
docker-compose restart backend

# Check for compilation errors
npm run build

# Verify guard registration in UserModule
grep -n "RolesGuard" src/user/user.module.ts
```

### Issue: All users getting blocked (including ADMIN)

**Possible Causes:**
1. `request.user` is not being set by JwtAuthGuard
2. User object fetched from database doesn't have `userType`

**Solution:**
Add debug logging in the guards:

```typescript
// In JwtAuthGuard
console.log('User from DB:', user);
request.user = user;

// In RolesGuard
console.log('Required roles:', requiredRoles);
console.log('User type:', user.userType);
```

## Error Response Examples

### CANDIDATE Access Attempt
```json
{
  "errors": [
    {
      "message": "Access denied. Required roles: ADMIN, SYSTEM. User role: CANDIDATE",
      "extensions": {
        "code": "FORBIDDEN",
        "exception": {
          "stacktrace": [...]
        }
      }
    }
  ]
}
```

### Unauthenticated Request
```json
{
  "errors": [
    {
      "message": "User not authenticated",
      "extensions": {
        "code": "FORBIDDEN",
        "exception": {
          "stacktrace": [...]
        }
      }
    }
  ]
}
```

### Missing User Type
```json
{
  "errors": [
    {
      "message": "User type not found",
      "extensions": {
        "code": "FORBIDDEN",
        "exception": {
          "stacktrace": [...]
        }
      }
    }
  ]
}
```

## Next Steps

1. Rebuild and restart the server
2. Run test cases above
3. Monitor server logs for any issues
4. Confirm CANDIDATE users are blocked
5. Confirm ADMIN/SYSTEM users can access endpoints
