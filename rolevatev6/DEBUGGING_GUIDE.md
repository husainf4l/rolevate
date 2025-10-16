# Company Profile Page - Status & Debugging Guide

## ✅ Current Status

The company profile page has been successfully migrated to use GraphQL API!

### Working Features:
1. ✅ **Fetch Company Profile** - Loads company data from GraphQL
2. ✅ **Logo Upload** - Uses multipart/form-data with GraphQL
3. ✅ **Form Structure** - All UI components properly connected

### File Upload Implementation

The logo upload is working and sends the correct multipart request format:

```
POST http://localhost:4005/graphql
Content-Type: multipart/form-data

operations: {"query":"mutation UploadFile($file: Upload!, $folder: String) {...}","variables":{"file":null,"folder":"company-logos"}}
map: {"0":["variables.file"]}
0: (binary file data)
```

## 🔍 Debugging Common Issues

### Issue 1: "GraphQL operations must contain a non-empty query"

**Symptoms:** Error appears in console/network tab

**Possible Causes:**
1. Another component is making a GraphQL request with empty query
2. Apollo Client cache is trying to refetch with malformed query
3. A subscription or polling query is misconfigured

**Debug Steps:**
```javascript
// Add this to see all GraphQL operations
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log('GraphQL Operation:', operation.operationName);
  console.log('Query:', operation.query);
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});
```

### Issue 2: Token Not Found / Unauthorized

**Symptoms:** 401 errors or "Unauthorized" messages

**Check:**
```javascript
// In browser console
console.log('Token:', localStorage.getItem('access_token'));
```

**Fix:** Make sure you're logged in and the auth service is storing the token:
```typescript
localStorage.setItem('access_token', token);
```

### Issue 3: Company Data Not Loading

**Symptoms:** Loading spinner never goes away, no data appears

**Debug:**
```javascript
// Add to fetchCompanyProfile in page.tsx
console.log('[DEBUG] Fetching company profile...');
const data = await companyService.getCompanyProfile();
console.log('[DEBUG] Company data:', data);
```

**Check GraphQL directly:**
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "query { me { company { id name email } } }"}'
```

### Issue 4: Logo Upload Fails

**Symptoms:** Upload button doesn't work, errors in console

**Check:**
1. File size (must be < 5MB)
2. File type (must be image/*)
3. S3 credentials configured in backend
4. Network tab shows multipart request

**Test Upload:**
Open `test-upload.html` in browser and test manually with your token.

## 🔧 Quick Fixes

### Fix 1: Clear Apollo Cache
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Fix 2: Verify Token Format
```javascript
// In browser console
const token = localStorage.getItem('access_token');
const parts = token?.split('.');
console.log('Token parts:', parts?.length); // Should be 3
console.log('Payload:', JSON.parse(atob(parts[1]))); // Decode JWT payload
```

### Fix 3: Check Token Expiry
```javascript
// In browser console
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiry = new Date(payload.exp * 1000);
const now = new Date();
console.log('Token expires:', expiry);
console.log('Is expired:', now > expiry);
```

## 📝 Testing Checklist

- [ ] GraphQL server running at http://localhost:4005/graphql
- [ ] User is logged in (check localStorage for access_token)
- [ ] Token is not expired (check exp claim in JWT)
- [ ] Navigate to http://localhost:3000/dashboard/company-profile
- [ ] Company data loads successfully
- [ ] Can upload company logo (< 5MB image)
- [ ] No console errors

## 🚀 Next Steps

### Backend Implementation Needed:
1. **Invitation Code Generation**
   - Mutation: `generateInvitationCode`
   - Returns: `{ code: String!, expiresAt: DateTime! }`

2. **Notification Settings**
   - Mutation: `updateNotificationSettings`
   - Input: All notification preferences

3. **Password Change**
   - Mutation: `changePassword`
   - Input: currentPassword, newPassword

4. **Company Users List**
   - Fix `users` field in CompanyDto to return actual users
   - Currently returns `null`

### Frontend Enhancements:
1. Add optimistic UI updates for logo upload
2. Add image preview before upload
3. Add cropping functionality for logos
4. Better error messages for each error type
5. Add loading skeleton instead of spinner

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify GraphQL server is running
4. Test queries directly with curl/Postman
5. Check this debugging guide

## 🔗 Useful Links

- GraphQL Playground: http://localhost:4005/graphql
- Test Upload Page: `test-upload.html`
- Migration Summary: `MIGRATION_SUMMARY.md`
- Services README: `src/services/README.md`
