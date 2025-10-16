# Quick Start: Business User Invitations

## What is this?

This feature allows **business users** in your company to invite other people to join the company as **business users** via a shareable link.

## How it works

```
Business User → Creates Invitation Link → Shares with Friend → Friend Joins Company as Business User
```

## GraphQL Mutations

### 1. Create Invitation (Business User)

```graphql
mutation CreateInvitation($input: CreateInvitationInput!) {
  createCompanyInvitation(input: $input) {
    invitationLink  # Share this link!
    code
    expiresAt
    userType
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "friend@example.com",  // Optional
    "expiresInHours": 168  // Optional, defaults to 7 days
  }
}
```

**Note:** The company ID is automatically retrieved from your authentication token. No need to pass it!

**Response:**
```json
{
  "data": {
    "createCompanyInvitation": {
      "invitationLink": "http://localhost:3000/invitation/a1b2c3d4e5f6...",
      "code": "a1b2c3d4e5f6...",
      "expiresAt": "2025-10-23T12:00:00.000Z",
      "userType": "BUSINESS"
    }
  }
}
```

### 2. Accept Invitation (New Business User)

```graphql
mutation AcceptInvitation($code: String!) {
  acceptCompanyInvitation(code: $code) {
    id
    status  # "ACCEPTED"
    usedAt
  }
}
```

**Variables:**
```json
{
  "code": "a1b2c3d4e5f6..."  // From the invitation link
}
```

## Frontend Example (React)

### Create Invitation Button

```tsx
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const CREATE_INVITATION = gql`
  mutation CreateInvitation($input: CreateInvitationInput!) {
    createCompanyInvitation(input: $input) {
      invitationLink
      code
      expiresAt
    }
  }
`;

function InviteButton() {
  const [createInvitation, { loading }] = useMutation(CREATE_INVITATION);

  const handleInvite = async () => {
    const { data } = await createInvitation({
      variables: { 
        input: {} // Empty input uses all defaults (BUSINESS user, 7 days)
      }
    });

    const link = data.createCompanyInvitation.invitationLink;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(link);
    alert('Invitation link copied! Share it with your team member.');
  };

  return (
    <button onClick={handleInvite} disabled={loading}>
      {loading ? 'Generating...' : 'Invite Team Member'}
    </button>
  );
}
```

### Invitation Acceptance Page

```tsx
// Route: /invitation/:code
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';

const GET_INVITATION = gql`
  query GetInvitation($code: String!) {
    getInvitation(code: $code) {
      id
      code
      status
      expiresAt
      companyId
    }
  }
`;

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($code: String!) {
    acceptCompanyInvitation(code: $code) {
      id
      status
    }
  }
`;

function AcceptInvitationPage() {
  const { code } = useParams();
  const { data, loading } = useQuery(GET_INVITATION, {
    variables: { code }
  });
  const [accept] = useMutation(ACCEPT_INVITATION);

  if (loading) return <div>Loading...</div>;
  if (!data?.getInvitation) return <div>Invalid invitation</div>;

  const handleAccept = async () => {
    await accept({ variables: { code } });
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div>
      <h1>You've been invited to join a company!</h1>
      <p>Expires: {new Date(data.getInvitation.expiresAt).toLocaleDateString()}</p>
      <button onClick={handleAccept}>Join as Business User</button>
    </div>
  );
}
```

## User Types

The system has 4 user types:

- **SYSTEM**: System administrators
- **CANDIDATE**: Job seekers/applicants
- **BUSINESS**: Company team members (default for invitations)
- **ADMIN**: Company administrators

Business users invite other **BUSINESS** users by default.

## Testing with GraphQL Playground

1. **Start your server:**
   ```bash
   npm run start:dev
   ```

2. **Open GraphQL Playground:**
   ```
   http://localhost:4005/graphql
   ```

3. **Login as a business user:**
   ```graphql
   mutation {
     login(email: "youruser@example.com", password: "yourpassword") {
       accessToken
       user {
         id
         companyId
         userType
       }
     }
   }
   ```

4. **Set Authorization header:**
   ```json
   {
     "Authorization": "Bearer YOUR_ACCESS_TOKEN"
   }
   ```

5. **Create invitation:**
   ```graphql
   mutation {
     createCompanyInvitation(input: {}) {
       invitationLink
       code
       expiresAt
     }
   }
   ```

6. **Copy the invitation link and open in incognito/private window**

7. **Register or login as a different user**

8. **Accept the invitation:**
   ```graphql
   mutation {
     acceptCompanyInvitation(code: "CODE_FROM_LINK") {
       status
     }
   }
   ```

9. **Verify the new user is now part of the company!**

## Key Features

✅ **One-click invite**: Business users can generate invite links instantly
✅ **No email required**: Share the link however you want (Slack, WhatsApp, etc.)
✅ **Automatic expiration**: Links expire after 7 days by default
✅ **One-time use**: Each link can only be used once
✅ **Secure codes**: Cryptographically secure 32-character codes

## Common Use Cases

1. **Onboarding new employees**: HR sends invite link via email
2. **Team expansion**: Business user invites colleague via Slack
3. **Partner access**: Share link with external business partners
4. **Event invitations**: Bulk invite for company events

## Security Notes

- Only existing company members can create invitations
- Invitation codes are 32-character cryptographically secure random strings
- Once used, invitation cannot be reused
- Expired invitations are automatically rejected
- Users must be authenticated to accept invitations

## Environment Setup

Add to your `.env`:

```bash
FRONTEND_URL=http://localhost:3000
```

This URL is used to generate the full invitation links.

## Support

For more details, see: `INVITATION-SYSTEM-GUIDE.md`
