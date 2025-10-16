# Company Invitation System

## Overview

The invitation system allows **company business users** to create shareable invitation links for new users to join their company as business users. This is a secure, flexible way to onboard team members.

## Features

- ✅ **Unique invitation codes**: Each invitation has a unique 32-character code
- ✅ **Optional email assignment**: Invitations can be pre-assigned to specific emails or remain open
- ✅ **Expiration control**: Set custom expiration times (default: 7 days)
- ✅ **Default to BUSINESS users**: Automatically invites as BUSINESS user type (company team members)
- ✅ **Status tracking**: PENDING, ACCEPTED, or CANCELLED
- ✅ **Usage tracking**: Track when invitations are used with `usedAt` timestamp
- ✅ **Access control**: Only company members can create/cancel invitations

## Database Schema

### Invitation Entity

```typescript
{
  id: UUID (primary key)
  code: string (unique, 32-char hex)
  email?: string (optional)
  userType: UserType (HR, HIRING_MANAGER, etc.)
  status: InvitationStatus (PENDING, ACCEPTED, CANCELLED)
  invitedById: UUID (user who created invitation)
  companyId?: UUID (company to join)
  expiresAt?: Date (when invitation expires)
  usedAt?: Date (when invitation was accepted)
  createdAt: Date
  updatedAt: Date
}
```

## GraphQL API

### 1. Create Invitation

Create a new invitation link for your company.

**Mutation:**
```graphql
mutation CreateCompanyInvitation($companyId: ID!, $input: CreateInvitationInput!) {
  createCompanyInvitation(companyId: $companyId, input: $input) {
    id
    code
    email
    userType
    status
    invitationLink
    expiresAt
    createdAt
  }
}
```

**Input:**
```graphql
input CreateInvitationInput {
  email: String  # Optional: pre-assign to specific email
  userType: UserType  # Optional: defaults to BUSINESS
  expiresInHours: Int  # Default: 168 (7 days)
}
```

**Example (inviting a business user to join company):**
```typescript
const { data } = await apolloClient.mutate({
  mutation: CREATE_COMPANY_INVITATION,
  variables: {
    companyId: "company-uuid-here",
    input: {
      // userType defaults to BUSINESS
      expiresInHours: 168,  // 7 days
      email: "newbusinessuser@example.com"  // Optional
    }
  }
});

// Share this link with the new business user
const invitationLink = data.createCompanyInvitation.invitationLink;
// Example: http://localhost:3000/invitation/a1b2c3d4e5f6...
```

### 2. Get Invitation Details

Retrieve invitation information by code (public - no auth required).

**Query:**
```graphql
query GetInvitation($code: String!) {
  getInvitation(code: $code) {
    id
    code
    email
    userType
    status
    invitationLink
    expiresAt
    usedAt
    createdAt
    companyId
  }
}
```

**Example:**
```typescript
const { data } = await apolloClient.query({
  query: GET_INVITATION,
  variables: {
    code: "a1b2c3d4e5f6..."  // From URL parameter
  }
});

const invitation = data.getInvitation;
// Show company info, user type, expiration, etc.
```

### 3. Validate Invitation Code

Check if an invitation is valid (not expired, not used, not cancelled).

**Mutation:**
```graphql
mutation ValidateInvitationCode($code: String!) {
  validateInvitationCode(code: $code)
}
```

**Example:**
```typescript
const { data } = await apolloClient.mutate({
  mutation: VALIDATE_INVITATION_CODE,
  variables: {
    code: "a1b2c3d4e5f6..."
  }
});

if (data.validateInvitationCode) {
  // Show registration form
} else {
  // Show error: invitation invalid/expired
}
```

### 4. Accept Invitation

Accept an invitation and join the company (requires authentication).

**Mutation:**
```graphql
mutation AcceptCompanyInvitation($code: String!) {
  acceptCompanyInvitation(code: $code) {
    id
    status
    usedAt
  }
}
```

**Example:**
```typescript
// User must be logged in first
const { data } = await apolloClient.mutate({
  mutation: ACCEPT_COMPANY_INVITATION,
  variables: {
    code: "a1b2c3d4e5f6..."
  },
  context: {
    headers: {
      authorization: `Bearer ${userToken}`
    }
  }
});

// User is now part of the company!
```

### 5. List Company Invitations

View all invitations for a company (requires authentication).

**Query:**
```graphql
query ListCompanyInvitations($companyId: ID!) {
  listCompanyInvitations(companyId: $companyId) {
    id
    code
    email
    userType
    status
    invitationLink
    expiresAt
    usedAt
    createdAt
  }
}
```

**Example:**
```typescript
const { data } = await apolloClient.query({
  query: LIST_COMPANY_INVITATIONS,
  variables: {
    companyId: "company-uuid-here"
  },
  context: {
    headers: {
      authorization: `Bearer ${userToken}`
    }
  }
});

const invitations = data.listCompanyInvitations;
// Display in a table: status, email, user type, created date, etc.
```

### 6. Cancel Invitation

Cancel a pending invitation (requires authentication).

**Mutation:**
```graphql
mutation CancelInvitation($invitationId: ID!) {
  cancelInvitation(invitationId: $invitationId) {
    id
    status
  }
}
```

**Example:**
```typescript
const { data } = await apolloClient.mutate({
  mutation: CANCEL_INVITATION,
  variables: {
    invitationId: "invitation-uuid-here"
  },
  context: {
    headers: {
      authorization: `Bearer ${userToken}`
    }
  }
});

// Invitation is now cancelled
```

## Frontend Integration

### React Example

```typescript
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_COMPANY_INVITATION, LIST_COMPANY_INVITATIONS } from './graphql/invitations';

function InvitationManager({ companyId }: { companyId: string }) {
  const [createInvitation] = useMutation(CREATE_COMPANY_INVITATION);
  const { data, refetch } = useQuery(LIST_COMPANY_INVITATIONS, {
    variables: { companyId }
  });

  const handleCreateInvitation = async () => {
    try {
      const result = await createInvitation({
        variables: {
          companyId,
          input: {
            userType: 'HR',
            expiresInHours: 168
          }
        }
      });

      const invitationLink = result.data.createCompanyInvitation.invitationLink;
      
      // Copy to clipboard
      navigator.clipboard.writeText(invitationLink);
      alert('Invitation link copied to clipboard!');
      
      // Refresh list
      refetch();
    } catch (error) {
      console.error('Failed to create invitation:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateInvitation}>
        Create Invitation Link
      </button>
      
      <h3>Active Invitations</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>User Type</th>
            <th>Status</th>
            <th>Expires At</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {data?.listCompanyInvitations.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.email || 'Open'}</td>
              <td>{inv.userType}</td>
              <td>{inv.status}</td>
              <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => {
                  navigator.clipboard.writeText(inv.invitationLink);
                }}>
                  Copy Link
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Invitation Acceptance Page

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_INVITATION, ACCEPT_COMPANY_INVITATION } from './graphql/invitations';

function AcceptInvitationPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const { data, loading, error } = useQuery(GET_INVITATION, {
    variables: { code }
  });

  const [acceptInvitation] = useMutation(ACCEPT_COMPANY_INVITATION);

  const handleAccept = async () => {
    try {
      await acceptInvitation({
        variables: { code }
      });
      
      alert('Successfully joined the company!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !data?.getInvitation) {
    return <div>Invalid or expired invitation</div>;
  }

  const invitation = data.getInvitation;

  return (
    <div>
      <h1>Join Company</h1>
      <p>You've been invited to join as: {invitation.userType}</p>
      {invitation.email && <p>Email: {invitation.email}</p>}
      <p>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</p>
      
      <button onClick={handleAccept}>
        Accept Invitation
      </button>
    </div>
  );
}
```

## Security Considerations

### 1. Code Generation
- Uses cryptographically secure random bytes
- 32-character hex strings (128 bits of entropy)
- Guaranteed uniqueness through database constraints

### 2. Access Control
- Only company members can create invitations for their company
- Only company members can cancel invitations
- Public access to view invitation details (needed for invitation page)
- User must be authenticated to accept invitation

### 3. Expiration
- Default expiration: 7 days (168 hours)
- Configurable per invitation
- Validation checks expiration before acceptance

### 4. Status Tracking
- PENDING: Not yet used
- ACCEPTED: Successfully used
- CANCELLED: Revoked by company admin
- Once used, cannot be reused (checked in validation)

## User Flow

### Creating Invitation (Business User)

```
1. Business user logs into company dashboard
2. Clicks "Invite Team Member"
3. Optionally enters email address of new business user
4. Sets expiration (or uses default 7 days)
5. System generates unique code
6. User receives shareable link: https://app.com/invitation/a1b2c3d4...
7. Business user shares link via email, Slack, WhatsApp, etc.
```

### Accepting Invitation (New Business User)

```
1. New business user receives invitation link
2. Clicks link → Redirected to /invitation/:code
3. Frontend fetches invitation details
4. Shows company info and expiration
5. If not logged in: Shows registration/login form
6. User creates account or logs in
7. User clicks "Join Company"
8. System validates invitation (not expired, not used)
9. Links user to company as BUSINESS user
10. Marks invitation as ACCEPTED with usedAt timestamp
11. User redirected to company dashboard
```

## Environment Variables

Add to your `.env` file:

```bash
# Frontend URL for generating invitation links
FRONTEND_URL=http://localhost:3000
```

## Testing

1. **Run the test script:**
   ```bash
   ts-node test-invitation-system.ts
   ```

2. **Update test variables:**
   - `TEST_COMPANY_ID`: Your company UUID
   - `TEST_USER_EMAIL`: User in that company
   - `TEST_PASSWORD`: User's password

3. **Manual testing:**
   - Create invitation via GraphQL Playground
   - Copy invitation link
   - Open in incognito/private window
   - Accept invitation with different user

## Troubleshooting

### "Invitation not found"
- Check that code is correct (32-char hex)
- Ensure invitation wasn't deleted from database

### "Invitation has expired"
- Check `expiresAt` timestamp
- Create new invitation if needed

### "Invitation has already been used"
- Check `usedAt` field
- Each invitation can only be used once
- Create new invitation if needed

### "You are not authorized to create invitations"
- User must be a member of the company
- Check `companyId` matches user's company

## Best Practices

1. **Expiration Times:**
   - Short-term invites: 24-48 hours
   - Standard invites: 7 days (default)
   - Long-term invites: 30 days (for planned hires)

2. **Email Pre-assignment:**
   - Use for specific known candidates
   - Leave blank for general recruitment links
   - Validate email on acceptance

3. **User Types:**
   - Be specific about role expectations
   - Match company's role hierarchy
   - Consider creating role-specific invite templates

4. **Link Sharing:**
   - Share via secure channels (email, company chat)
   - Don't post publicly unless intentional
   - Consider using email-specific invites for sensitive roles

5. **Monitoring:**
   - Regularly review pending invitations
   - Cancel expired or unused invitations
   - Track acceptance rates by source

## Future Enhancements

- [ ] Email notifications when invitation is created
- [ ] Reminder emails for pending invitations
- [ ] Invitation usage analytics
- [ ] Bulk invitation creation
- [ ] Custom invitation messages
- [ ] Role-based permission templates
- [ ] Integration with onboarding workflows
