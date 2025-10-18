# Company Join Page Implementation

## Overview
The join page allows users to create an account and join a company using an invitation code.

## URL Structure
```
http://localhost:3000/join?code=INVITATION_CODE
```

Example:
```
http://localhost:3000/join?code=4d2fa32738e00dc3aedb59f05211bd5a
```

## GraphQL Flow

### 1. Get Invitation Details
```graphql
query GetInvitation($code: String!) {
  getInvitation(code: $code) {
    id
    code
    email
    companyId
    status
    expiresAt
    createdAt
  }
}
```

**Response:**
```json
{
  "id": "d74512a1-e0b4-4b56-bec4-183ba8c95a48",
  "code": "4d2fa32738e00dc3aedb59f05211bd5a",
  "email": null,
  "companyId": "19cf3f8e-1d43-4a8e-a2ad-ffebaf4706ab",
  "status": "PENDING",
  "expiresAt": "2025-10-25T22:03:06.960Z",
  "createdAt": "2025-10-18T22:03:07.055Z"
}
```

### 2. Get Company Details
```graphql
query GetCompany($id: ID!) {
  company(id: $id) {
    id
    name
    logo
    industry
    website
  }
}
```

### 3. Create User Account
```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    name
    userType
  }
}
```

**Input:**
```typescript
{
  userType: "BUSINESS"  // or "CANDIDATE"
  name: string
  email: string
  password: string
  phone?: string | null
}
```

### 4. Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    access_token
    user {
      id
      email
      name
      userType
    }
  }
}
```

**Note:** The backend only returns `access_token`, not `refresh_token`.

### 5. Accept Invitation
```graphql
mutation AcceptInvitation($code: String!) {
  acceptCompanyInvitation(code: $code)
}
```

**Important:** This mutation requires authentication. Send the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Page States

### 1. Loading
- Shows while fetching invitation and company details
- Displays spinner animation

### 2. Error
Shown when:
- No invitation code in URL
- Invalid invitation code
- Invitation already used (status !== "PENDING")
- Invitation expired
- Failed to load invitation/company

### 3. Form
- Displays company information (if available)
- Signup form with fields:
  - Full Name (required)
  - Email (required, pre-filled if invitation has email)
  - Phone (optional)
  - Password (required, min 8 characters)
  - Confirm Password (required, must match)
- Form validation before submission

### 4. Success
- Shows success message
- Displays company name
- Auto-redirects to dashboard after 2 seconds

## Validation Rules

### Email
- Required
- Must be valid email format
- May be pre-filled and disabled if invitation includes email

### Password
- Required
- Minimum 8 characters
- Must match confirmation password

### Name
- Required
- Cannot be empty

### Phone
- Optional
- No specific format validation

## User Flow

1. User receives invitation link with code
2. Opens link: `/join?code=INVITATION_CODE`
3. Page validates invitation code
4. If valid, shows company info and signup form
5. User fills in details
6. On submit:
   - Creates user account with `createUser` mutation
   - Logs in user with `login` mutation
   - Stores access_token in localStorage
   - Accepts invitation with `acceptCompanyInvitation` mutation
   - Redirects to dashboard

## Files Created

1. **`/src/app/(website)/join/page.tsx`**
   - Main join page component
   - Handles all UI states
   - Form validation
   - User flow orchestration

2. **`/src/services/invitation.service.ts`**
   - GraphQL operations for invitations
   - `getInvitation(code)` - Fetch invitation details
   - `getCompanyById(id)` - Fetch company details
   - `createUser(input)` - Create new user
   - `login(email, password)` - Login user
   - `acceptCompanyInvitation(code, accessToken)` - Accept invitation

## Testing

### Test with valid code:
```bash
# Open in browser
http://localhost:3000/join?code=4d2fa32738e00dc3aedb59f05211bd5a
```

### Test invitation validation:
```bash
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getInvitation(code: \"4d2fa32738e00dc3aedb59f05211bd5a\") { id code email companyId status expiresAt } }"}'
```

### Test user creation:
```bash
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createUser(input: { userType: BUSINESS, name: \"Test User\", email: \"test@example.com\", password: \"password123\" }) { id email name userType } }"}'
```

## Error Handling

The page handles these error scenarios:
- Missing invitation code
- Invalid invitation code
- Expired invitation
- Already used invitation
- Network errors
- User creation failures
- Login failures
- Invitation acceptance failures

Each error displays a user-friendly message with option to return to login page.

## Security Considerations

1. **Password Requirements**: Minimum 8 characters
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **Invitation Validation**: Server-side validation of invitation status and expiry
4. **Email Pre-filling**: If invitation has email, field is pre-filled and disabled
5. **Authenticated Invitation Acceptance**: Requires valid access token

## Future Enhancements

- [ ] Email verification before accepting invitation
- [ ] Password strength indicator
- [ ] Company logo display
- [ ] Terms of service acceptance checkbox
- [ ] Invitation preview (show who invited you)
- [ ] Multi-step form with progress indicator
- [ ] Social signup options (Google, LinkedIn)
- [ ] Resend invitation link if expired
