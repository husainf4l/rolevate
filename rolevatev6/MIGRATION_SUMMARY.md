# Company Profile Page - GraphQL Migration Summary

## Overview
Successfully migrated the company profile page from REST API to GraphQL API (http://localhost:4005/graphql).

## Changes Made

### 1. Created New Service: `company.service.ts`
**Location:** `/src/services/company.service.ts`

**Features:**
- `getCompanyProfile()` - Fetches company profile using the `me` query
- `generateInvitationCode()` - Placeholder for invitation code generation (not yet in API)
- `uploadLogo()` - Uploads company logo to S3 and updates company
- `updateNotificationSettings()` - Placeholder for notification settings (not yet in API)
- `changePassword()` - Placeholder for password change (not yet in API)

**GraphQL Queries Used:**
```graphql
query GetMe {
  me {
    id
    name
    email
    userType
    companyId
    company {
      id
      name
      description
      industry
      website
      email
      phone
      logo
      size
      founded
      location
      addressId
      createdAt
      updatedAt
      users {
        id
        name
        email
      }
    }
  }
}
```

**GraphQL Mutations Used:**
```graphql
mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
  updateCompany(id: $id, input: $input) {
    id
    name
    description
    industry
    website
    email
    phone
    logo
    size
    founded
    location
  }
}
```

### 2. Updated Page: `company-profile/page.tsx`
**Location:** `/src/app/dashboard/company-profile/page.tsx`

**Changes:**
- Removed REST API calls (fetch with `API_CONFIG.API_BASE_URL`)
- Integrated `companyService` for all data operations
- Updated `fetchCompanyProfile()` to use GraphQL
- Updated `generateInvitationCode()` to use GraphQL service
- Updated `handleLogoUpload()` to use GraphQL service
- Updated `saveNotificationSettings()` to use GraphQL service
- Updated password change form to use GraphQL service
- Added proper error handling with user-friendly messages

## GraphQL API Schema Discovery

### Available Queries
- `me` - Get current user with company details
- `company(id: ID!)` - Get company by ID
- `companies` - List all companies
- `companiesByUser(userId: ID!)` - Get companies by user

### Available Mutations
- `createCompany(input: CreateCompanyInput!)` - Create new company
- `updateCompany(id: ID!, input: UpdateCompanyInput!)` - Update company
- `removeCompany(id: ID!)` - Delete company
- `generateCompanyDescription(input: CompanyDescriptionRequestDto!)` - AI-generated descriptions
- `polishAboutCompany(input: AboutCompanyPolishRequestDto!)` - Polish company description

### Company Data Structure
```typescript
interface CompanyDto {
  id: ID!
  name: String!
  description: String
  website: String
  email: String
  phone: String
  logo: String
  industry: String
  size: String
  founded: DateTime
  location: String
  addressId: String
  users: [UserDto]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## Testing

### Test Query with Your Token
```bash
curl -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcmlhQG1hcmdvZ3JvdXAubmV0Iiwic3ViIjoiZTk0ZjliNjItOGI0Ny00OGI0LTgwM2UtODIwYmQxNzZjZmU5IiwidXNlclR5cGUiOiJCVVNJTkVTUyIsImlhdCI6MTc2MDU2OTE4NCwiZXhwIjoxNzYwNTcyNzg0fQ.AjgngbkCeFSYwwGOKAtFMPFCnS9lkQIrRIR7fkHovRk" \
  -d '{"query": "query GetMe { me { id name email company { id name description industry website email phone logo size } } }"}'
```

### Expected Response
```json
{
  "data": {
    "me": {
      "id": "e94f9b62-8b47-48b4-803e-820bd176cfe9",
      "name": "fatol maria",
      "email": "maria@margogroup.net",
      "company": {
        "id": "c0fada92-da86-40a3-9cf1-57b33ed5900c",
        "name": "papaya trading",
        "description": "iuhgff",
        "industry": "ENERGY",
        "website": "https://ammanpashahotel.com/",
        "email": "husain.f4l@gmail.com",
        "phone": "0796026659",
        "logo": null,
        "size": "201-1000"
      }
    }
  }
}
```

## Features Not Yet Available in GraphQL API

The following features are referenced in the UI but not yet fully implemented in the backend:

1. **Invitation Code Generation**
   - Current: Placeholder returns error message
   - Needed: Backend mutation for generating invitation codes
   - UI: "Generate Invite Link" button on Team Members tab

2. **Notification Settings**
   - Current: Placeholder returns error message  
   - Needed: Backend mutation for saving notification preferences
   - UI: Notifications tab with various toggle switches

3. **Password Change**
   - Current: Placeholder returns error message
   - Needed: Backend mutation for changing user password
   - UI: Security tab with password change form

4. **Company Stats, Values, Benefits**
   - These fields are not in the current CompanyDto
   - UI displays them if available in the data
   - Consider adding to schema if required for business needs

5. **Company Users List**
   - The `users` field in CompanyDto returns `null` in current API
   - Need backend to populate this field with company team members
   - UI: Team Members tab expects array of user objects

## File Upload Implementation

The logo upload uses a multi-part form data approach compatible with GraphQL:

```javascript
// GraphQL multipart request specification
const operations = {
  query: `mutation UploadFile($file: Upload!, $folder: String) {
    uploadFileToS3(file: $file, folder: $folder) {
      url
      key
      bucket
    }
  }`,
  variables: { file: null, folder: 'company-logos' }
};

const map = { '0': ['variables.file'] };

// FormData structure
formData.append('operations', JSON.stringify(operations));
formData.append('map', JSON.stringify(map));
formData.append('0', file); // The actual file
```

This follows the [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec).

## Next Steps

### Backend Tasks
1. Implement `generateInvitationCode` mutation
2. Implement `updateNotificationSettings` mutation
3. Implement `changePassword` mutation
4. Add file upload support for company logos via GraphQL
5. Consider adding: company values, benefits, stats fields

### Frontend Tasks
1. Test file upload functionality when backend is ready
2. Update error messages based on actual API responses
3. Add loading states for all async operations
4. Consider adding optimistic UI updates

## Token Management

The Apollo Client is configured to read tokens from `localStorage.getItem('access_token')`.

**Location:** `/src/lib/apollo.ts`

Make sure the authentication flow stores the token with key `access_token`:
```typescript
localStorage.setItem('access_token', token);
```

## Benefits of Migration

1. **Type Safety**: GraphQL provides strong typing
2. **Efficient Data Fetching**: Request only needed fields
3. **Single Endpoint**: All requests go to one GraphQL endpoint
4. **Better Error Handling**: Structured error responses
5. **API Documentation**: Self-documenting via introspection
6. **Consistency**: All pages can use the same Apollo Client setup

## Files Modified

1. `/src/services/company.service.ts` - NEW
2. `/src/app/dashboard/company-profile/page.tsx` - UPDATED

## Dependencies

- `@apollo/client` - Already installed
- GraphQL API running at `http://localhost:4005/graphql`
- Valid JWT token for authentication
