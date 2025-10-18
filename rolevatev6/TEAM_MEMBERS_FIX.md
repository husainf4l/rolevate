# Company Invitation Fix - Team Members Not Showing

## Problem
After accepting a company invitation, the user wasn't appearing in the team members list on the company profile page.

## Root Cause
When a user accepts a company invitation via `acceptCompanyInvitation` mutation:
1. The invitation status is updated to "ACCEPTED"
2. The user's `companyId` is updated in the database
3. **However**, the JWT access token still contains the old `companyId: null` value

When the user is redirected to the dashboard and loads the company profile page, their token doesn't have the updated `companyId`, so the backend query doesn't return them as part of the company's users.

## Solution
Added a re-login step after accepting the invitation to get a fresh JWT token with the updated `companyId`.

### Updated Flow

**Before (Not Working):**
1. Create user account
2. Login → get access_token (with `companyId: null`)
3. Accept invitation → backend updates user's companyId in database
4. Redirect to dashboard → token still has `companyId: null`
5. ❌ Company profile shows no team members

**After (Working):**
1. Create user account
2. Login → get access_token (with `companyId: null`)
3. Accept invitation → backend updates user's companyId in database
4. **Login again** → get fresh access_token (with updated `companyId`)
5. Save new token
6. Redirect to dashboard → token has correct `companyId`
7. ✅ Company profile shows user as team member

## Code Changes

### `/src/app/(website)/join/page.tsx`

```typescript
// Step 2: Login to get access token
const loginData = await loginService(formData.email, formData.password);

// Step 3: Accept the invitation
await acceptCompanyInvitation(code!, loginData.access_token);

// Step 4: Login again to get updated token with companyId
const updatedLoginData = await loginService(formData.email, formData.password);

if (updatedLoginData?.access_token) {
  // Update token with the new one that includes companyId
  localStorage.setItem("access_token", updatedLoginData.access_token);
}

// Success!
setStep("success");
```

## Verification

### Before Fix:
```bash
# User token after accepting invitation
{
  "email": "abcd@gmail.com",
  "sub": "d3f3767f-05ae-4c88-9252-d8656ccfda5e",
  "userType": "BUSINESS",
  "companyId": null  # ❌ Still null
}
```

### After Fix:
```bash
# User token after re-login
{
  "email": "abcd@gmail.com",
  "sub": "d3f3767f-05ae-4c88-9252-d8656ccfda5e",
  "userType": "BUSINESS",
  "companyId": "19cf3f8e-1d43-4a8e-a2ad-ffebaf4706ab"  # ✅ Updated!
}
```

## Testing

1. Generate invitation code from company profile
2. Open join link: `http://localhost:3000/join?code=INVITATION_CODE`
3. Fill in signup form and submit
4. Verify redirection to dashboard
5. Navigate to Company Profile → Team Members tab
6. ✅ User should now appear in the team members list

## Additional Notes

- The re-login is transparent to the user (happens in the background)
- No UI changes required as the process is automatic
- The team members query in `company.service.ts` fetches users associated with the company
- The query works correctly once the user has the proper `companyId` in their token

## Files Modified

1. `/src/app/(website)/join/page.tsx` - Added re-login step after accepting invitation
