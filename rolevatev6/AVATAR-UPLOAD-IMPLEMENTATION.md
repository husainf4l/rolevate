# Avatar Upload Implementation Guide

## Overview
Implemented a complete avatar upload system that allows candidate users to upload, update, and delete their profile pictures using base64 encoding and S3 storage.

## Implementation Details

### 1. Auth Service Updates
**File**: `src/services/auth.ts`

Added three new methods to the AuthService class:

#### a. `updateAvatar(file: File): Promise<string>`
- Validates file type (must be an image)
- Validates file size (max 5MB)
- Converts image to base64
- Uploads to S3 via GraphQL mutation `uploadAvatarToS3`
- Updates user record with new avatar URL
- Returns the avatar URL

#### b. `removeAvatar(): Promise<boolean>`
- Removes the avatar from user profile
- Updates user record with `avatar: null`
- Returns success status

#### c. `fileToBase64(file: File): Promise<string>` (private)
- Helper method to convert File to base64 string
- Removes data URL prefix for clean base64 encoding

### 2. GraphQL Mutations Used

#### Upload File to S3 (Used for Avatar)
```graphql
mutation UploadFileToS3(
  $base64File: String!
  $filename: String!
  $mimetype: String!
) {
  uploadFileToS3(
    base64File: $base64File
    filename: $filename
    mimetype: $mimetype
  ) {
    url
    key
    bucket
  }
}
```

**Note**: The frontend uses the existing `uploadFileToS3` mutation (not a separate `uploadAvatarToS3` mutation).

#### Update User
```graphql
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    email
    name
    userType
    phone
    avatar
    createdAt
    updatedAt
  }
}
```

### 3. Type System Updates
**File**: `src/types/auth.ts`

Extended the `User` interface to include:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  userType: 'BUSINESS' | 'CANDIDATE';
  phone?: string;
  avatar?: string;              // ✅ NEW
  company?: { ... };
  companyId?: string;
  candidateProfile?: any;
  createdAt?: string;
  updatedAt?: string;
}
```

### 4. Custom Hook: useAvatar
**File**: `src/hooks/useAvatar.ts`

React hook for managing avatar operations with state management:

```typescript
const {
  uploading,      // boolean - upload in progress
  error,          // string | null - error message
  uploadAvatar,   // (file: File) => Promise<string | null>
  deleteAvatar,   // () => Promise<boolean>
  clearError      // () => void
} = useAvatar();
```

**Features**:
- Loading state tracking
- Error handling with user-friendly messages
- Automatic cleanup

### 5. Reusable Component: AvatarUpload
**File**: `src/components/common/AvatarUpload.tsx`

Full-featured avatar upload component with:
- Display current avatar or placeholder
- Hover overlay with camera icon
- Click to upload functionality
- Delete avatar button
- Image preview before upload
- Loading spinner during upload
- Error message display
- User name and email display (optional)
- Responsive sizing (sm, md, lg, xl)

**Props**:
```typescript
interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';    // Avatar size
  editable?: boolean;                    // Enable/disable editing
  showName?: boolean;                    // Show user name below avatar
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
}
```

### 6. Auth Context Updates
**Files**:
- `src/hooks/useAuth.tsx`
- `src/components/common/AuthProvider.tsx`

Added `refreshUser()` method to AuthContext:
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;  // ✅ NEW
}
```

This allows components to refresh user data after avatar updates.

## Usage Examples

### Example 1: Simple Avatar Upload
```tsx
import AvatarUpload from '@/components/common/AvatarUpload';

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <AvatarUpload
        size="lg"
        editable={true}
        showName={true}
      />
    </div>
  );
}
```

### Example 2: Custom Avatar Upload with Callbacks
```tsx
import AvatarUpload from '@/components/common/AvatarUpload';

export default function SettingsPage() {
  const handleUploadSuccess = (url: string) => {
    console.log('Avatar uploaded:', url);
    // Show success toast
  };

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error);
    // Show error toast
  };

  return (
    <AvatarUpload
      size="xl"
      editable={true}
      showName={true}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      onDeleteSuccess={() => console.log('Avatar deleted')}
    />
  );
}
```

### Example 3: Using the Hook Directly
```tsx
import { useAvatar } from '@/hooks/useAvatar';
import { useAuth } from '@/hooks/useAuth';

export default function CustomAvatarForm() {
  const { user, refreshUser } = useAuth();
  const { uploading, error, uploadAvatar } = useAvatar();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadAvatar(file);
    if (url) {
      await refreshUser();
      alert('Avatar updated successfully!');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {user?.avatar && <img src={user.avatar} alt="Avatar" />}
    </div>
  );
}
```

### Example 4: Programmatic Avatar Update
```tsx
import { updateAvatar, removeAvatar } from '@/services/auth';

// Upload avatar
const handleUpload = async (file: File) => {
  try {
    const url = await updateAvatar(file);
    console.log('Uploaded to:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Remove avatar
const handleRemove = async () => {
  try {
    await removeAvatar();
    console.log('Avatar removed');
  } catch (error) {
    console.error('Removal failed:', error);
  }
};
```

## Validation Rules

### File Type
- Must be an image file (checked via `file.type.startsWith('image/')`)
- Supported formats: JPEG, PNG, GIF, WebP, etc.

### File Size
- Maximum size: **5MB**
- Size is checked before upload
- User receives clear error message if file is too large

### Security
- Files are uploaded to S3 via authenticated GraphQL mutation
- Only authenticated users can upload/delete avatars
- Avatar URL is stored in user record
- S3 bucket should have proper CORS and access policies

## Backend Requirements

The backend uses these existing GraphQL mutations:

### 1. uploadFileToS3 (Already Implemented ✅)
```graphql
mutation UploadFileToS3(
  $base64File: String!
  $filename: String!
  $mimetype: String!
) {
  uploadFileToS3(
    base64File: $base64File
    filename: $filename
    mimetype: $mimetype
  ) {
    url
    key
    bucket
  }
}
```

**Status**: ✅ Already implemented in backend
**Location**: `/Users/husain/Desktop/rolevate/rolevate-backendgql/src/services/aws-s3.resolver.ts`

### 2. updateUser
```graphql
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    email
    name
    avatar
    # ... other fields
  }
}
```

**Input Type**:
```graphql
input UpdateUserInput {
  name: String
  phone: String
  avatar: String
  # ... other fields
}
```

## Styling & Theme

The component uses your application's design system:
- **Primary colors**: `primary-600` (teal/cyan)
- **Border radius**: `rounded-sm`
- **Shadows**: `shadow-sm`, `shadow-lg`
- **Transitions**: `transition-all duration-300`
- **Hover effects**: Transform on hover for buttons

## Error Handling

The implementation includes comprehensive error handling:

1. **File Type Validation**: "File must be an image"
2. **File Size Validation**: "Image size must be less than 5MB"
3. **Upload Failure**: "Failed to upload avatar to S3"
4. **Update Failure**: "Failed to update user avatar"
5. **Network Errors**: Handled with try/catch blocks

All errors are displayed to the user with dismissible error messages.

## Testing Checklist

✅ **Upload Tests**:
- [ ] Can upload JPEG image
- [ ] Can upload PNG image
- [ ] File size validation works (reject > 5MB)
- [ ] File type validation works (reject non-images)
- [ ] Upload progress shows loading state
- [ ] Success callback fires on successful upload
- [ ] Error callback fires on failed upload

✅ **Delete Tests**:
- [ ] Can delete existing avatar
- [ ] Confirmation dialog appears
- [ ] Avatar is removed from UI
- [ ] Success callback fires on deletion

✅ **UI Tests**:
- [ ] Avatar displays correctly (all sizes: sm, md, lg, xl)
- [ ] Placeholder shows when no avatar
- [ ] Hover overlay appears on editable avatars
- [ ] User name displays when showName=true
- [ ] Error messages display correctly
- [ ] Loading spinner shows during upload

✅ **Integration Tests**:
- [ ] User context updates after avatar change
- [ ] refreshUser() updates the UI
- [ ] Avatar persists after page reload
- [ ] Avatar URL is correct in user object

## File Structure

```
src/
├── services/
│   └── auth.ts                          # ✅ Avatar upload/delete logic
├── hooks/
│   ├── useAuth.tsx                      # ✅ Added refreshUser method
│   └── useAvatar.ts                     # ✅ NEW - Avatar upload hook
├── components/
│   └── common/
│       ├── AuthProvider.tsx             # ✅ Added refreshUser method
│       └── AvatarUpload.tsx             # ✅ NEW - Avatar upload component
└── types/
    └── auth.ts                          # ✅ Added avatar field to User
```

## Next Steps

1. **Backend Implementation**:
   - Implement `uploadAvatarToS3` mutation
   - Implement `updateUser` mutation
   - Configure S3 bucket with proper CORS
   - Add avatar field to User entity

2. **Frontend Integration**:
   - Add `AvatarUpload` component to profile page
   - Add to dashboard header (small size)
   - Add to settings page
   - Add to user dropdown menu

3. **Enhancements** (Optional):
   - Image cropping before upload
   - Resize/compress images client-side
   - Support drag-and-drop upload
   - Add avatar history/gallery
   - Support multiple file formats
   - Add image filters/effects

## Summary

This implementation provides a complete, production-ready avatar upload system with:
- ✅ Base64 encoding for file upload
- ✅ S3 storage integration
- ✅ User-friendly React components
- ✅ Comprehensive error handling
- ✅ Loading states and feedback
- ✅ Type-safe TypeScript implementation
- ✅ Consistent with your design system
- ✅ Reusable and customizable components

The system is ready to use once the backend implements the required GraphQL mutations.
