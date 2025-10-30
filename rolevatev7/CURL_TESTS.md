# Backend API CURL Tests

## Test Change Password Endpoint

### Prerequisites
1. Get an access token by logging in first:

```bash
curl -X POST http://192.168.1.210:4005/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id email } } }",
    "variables": {
      "email": "your-email@example.com",
      "password": "your-current-password"
    }
  }'
```

### Test Change Password

Replace `YOUR_ACCESS_TOKEN` with the token from login response:

```bash
curl -X POST http://192.168.1.210:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "query": "mutation ChangePassword($input: ChangePasswordInput!) { changePassword(input: $input) }",
    "variables": {
      "input": {
        "currentPassword": "your-current-password",
        "newPassword": "your-new-password-123"
      }
    }
  }'
```

### Expected Response (Success)
```json
{
  "data": {
    "changePassword": true
  }
}
```

### Expected Response (Error)
```json
{
  "errors": [
    {
      "message": "Current password is incorrect"
    }
  ]
}
```

## Verify Changes in Frontend

1. **Company Profile Password Change**: 
   - Navigate to `/dashboard/company-profile`
   - Scroll to "Security Settings" section
   - Click "Change Password" tab
   - Enter current and new password
   - Click "Update Password"

2. **User/Candidate Profile Password Change**:
   - Navigate to `/dashboard/profile`
   - Scroll to "Security Settings" section
   - Click "Change Password" tab
   - Enter current and new password
   - Click "Change Password"

## Notes
- Minimum password length: 8 characters
- Both old and new passwords are required
- New passwords must match confirmation field
- After successful change, you may need to re-login
