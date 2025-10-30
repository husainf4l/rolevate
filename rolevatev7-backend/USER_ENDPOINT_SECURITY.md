# User Endpoint Security Implementation

## Overview
Implemented role-based access control (RBAC) to restrict user-related GraphQL endpoints to only ADMIN and SYSTEM users.

## Changes Made

### File: `src/user/user.resolver.ts`

#### 1. **Imports Updated**
- Added `Roles` decorator from `auth/roles.decorator`
- Added `RolesGuard` from `auth/roles.guard`
- Added `UserType` enum from `user.entity`
- Removed unused `ApiKeyGuard`

#### 2. **Protected Endpoints**

##### Query: `users()` - Get all users
- **Before:** Only required JWT authentication
- **After:** Requires JWT authentication AND (ADMIN or SYSTEM role)
- **Decorator Stack:** 
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.SYSTEM)
  ```

##### Query: `user(id)` - Get user by ID
- **Before:** Used ApiKeyGuard only
- **After:** Requires JWT authentication AND (ADMIN or SYSTEM role)
- **Decorator Stack:**
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.SYSTEM)
  ```

##### Mutation: `createUser()` - Create new user
- **Before:** Public (no authentication required)
- **After:** Requires JWT authentication AND (ADMIN or SYSTEM role)
- **Decorator Stack:**
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.SYSTEM)
  ```

##### Mutation: `updateUser()` - Update user
- **Before:** Only required JWT authentication with unclear authorization logic
- **After:** Requires JWT authentication AND (ADMIN or SYSTEM role)
- **Decorator Stack:**
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.SYSTEM)
  ```

#### 3. **Unprotected Endpoints** (Intentionally left as-is)

##### Query: `me()` - Get current user profile
- **Protection:** JWT authentication only
- **Reason:** Users should be able to view their own profile
- **Access:** Any authenticated user

##### Mutation: `changePassword()` - Change user password
- **Protection:** JWT authentication only
- **Reason:** Users should be able to change their own password
- **Access:** Any authenticated user

## Security Model

### UserType Enum
- `SYSTEM` - System administrator with full access
- `ADMIN` - Administrative users with management capabilities
- `BUSINESS` - Business/company users
- `CANDIDATE` - Job candidates

### Authorization Flow
1. Request arrives at endpoint
2. `JwtAuthGuard` validates JWT token exists and is valid
3. `RolesGuard` checks if user's `userType` matches required roles
4. If both guards pass, endpoint executes
5. If either guard fails, request is rejected with 403 Forbidden

## Testing Recommendations

### Test Cases to Verify:

1. **Admin User** - Should access all protected endpoints ✓
2. **System User** - Should access all protected endpoints ✓
3. **Business User** - Should be denied from protected endpoints ✗
4. **Candidate User** - Should be denied from protected endpoints ✗
5. **Unauthenticated User** - Should be denied from all endpoints ✗
6. **Users can still access `me()` query** - Should work for any authenticated user ✓
7. **Users can still change own password** - Should work for any authenticated user ✓

## API Usage Examples

### Query: Get all users (Admin/System only)
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

### Query: Get specific user (Admin/System only)
```graphql
query {
  user(id: "user-id") {
    id
    email
    name
    userType
  }
}
```

### Mutation: Create user (Admin/System only)
```graphql
mutation {
  createUser(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
    userType: BUSINESS
  }) {
    id
    email
    name
  }
}
```

### Mutation: Update user (Admin/System only)
```graphql
mutation {
  updateUser(id: "user-id", input: {
    name: "Jane Doe"
    phone: "1234567890"
  }) {
    id
    name
    phone
  }
}
```

### Query: Get current user (Any authenticated user)
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

### Mutation: Change password (Any authenticated user)
```graphql
mutation {
  changePassword(input: {
    currentPassword: "old123"
    newPassword: "new123"
  })
}
```

## Benefits

1. **Security:** User management endpoints are now restricted to authorized administrators only
2. **Compliance:** Meets basic role-based access control requirements
3. **Data Protection:** Prevents unauthorized users from viewing, creating, or modifying user records
4. **Auditability:** Admin actions can be traced to specific admin users
5. **Principle of Least Privilege:** Users only have access to what they need
