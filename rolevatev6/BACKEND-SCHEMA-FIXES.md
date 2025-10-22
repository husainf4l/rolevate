# Backend Schema Fixes & Workarounds

## Overview
This document explains the GraphQL schema limitations found in the backend and the workarounds implemented in the frontend.

---

## Issue 1: UserDto Missing candidateProfile Field

### Problem
The `me` query returns a `UserDto` object that does NOT include the `candidateProfile` field, even though the underlying `User` entity has a relationship to `CandidateProfile`.

**Backend File**: `/Users/husain/Desktop/rolevate/rolevate-backendgql/src/user/user.dto.ts`

```typescript
@ObjectType()
export class UserDto {
  @Field() id: string;
  @Field(() => UserType) userType: UserType;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) avatar?: string;
  @Field() isActive: boolean;
  @Field({ nullable: true }) companyId?: string;
  @Field(() => CompanyDto, { nullable: true }) company?: CompanyDto;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;

  // ❌ MISSING: candidateProfile field
}
```

### Impact
- Cannot fetch candidate profile data directly from `me` query
- Cannot access CVs through the user object
- Requires multiple queries to get user + candidate profile data

### Frontend Workaround

**File**: `src/services/cv.ts`

The CV service now uses a two-step approach:

```typescript
async getCVs(): Promise<CVData[]> {
  // Step 1: Get current user's ID from 'me' query
  const { data: userData } = await apolloClient.query({
    query: GET_USER_ID_QUERY,  // me { id }
    fetchPolicy: 'network-only'
  });

  // Step 2: Query candidateProfileByUser with the user ID
  const { data: cvData } = await apolloClient.query({
    query: GET_CVS_QUERY,  // candidateProfileByUser(userId) { cvs { ... } }
    variables: { userId: userData.me.id },
    fetchPolicy: 'network-only'
  });

  return cvData?.candidateProfileByUser?.cvs || [];
}
```

### Recommended Backend Fix

Update `UserDto` to include the `candidateProfile` field:

```typescript
// In /Users/husain/Desktop/rolevate/rolevate-backendgql/src/user/user.dto.ts
import { CandidateProfile } from '../candidate/candidate-profile.entity';

@ObjectType()
export class UserDto {
  // ... existing fields ...

  @Field(() => CandidateProfile, { nullable: true })
  candidateProfile?: CandidateProfile;
}
```

And update the `me` resolver to include it:

```typescript
// In /Users/husain/Desktop/rolevate/rolevate-backendgql/src/user/user.resolver.ts
@Query(() => UserDto)
@UseGuards(JwtAuthGuard)
async me(@Context() context: any): Promise<UserDto> {
  const userId = context.req.user.id;
  const user = await this.userService.findOne(userId, {
    relations: ['candidateProfile', 'candidateProfile.cvs']  // ✅ Include relations
  });

  if (!user) throw new Error('User not found');

  return {
    // ... existing fields ...
    candidateProfile: user.candidateProfile,  // ✅ Include candidate profile
  };
}
```

This would allow a single query:
```graphql
query {
  me {
    id
    name
    email
    candidateProfile {
      id
      firstName
      lastName
      cvs {
        id
        fileName
        fileUrl
      }
    }
  }
}
```

---

## Issue 2: CV Entity Structure

### Current Structure
CVs are stored in the `CV` entity with the following fields:

**Backend File**: `/Users/husain/Desktop/rolevate/rolevate-backendgql/src/candidate/cv.entity.ts`

```typescript
@Entity()
@ObjectType()
export class CV {
  @Field(() => ID) id: string;
  candidateProfileId: string;
  @Field() fileName: string;
  @Field() fileUrl: string;
  @Field({ nullable: true }) fileSize?: number;
  @Field({ nullable: true }) mimeType?: string;
  @Field() isPrimary: boolean;
  @Field() uploadedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;

  // ❌ NOT PRESENT: status, analysisResults fields
}
```

### Frontend CVData Interface

The frontend expects additional fields that don't exist in the backend:

```typescript
export interface CVData {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;        // ✅ Available
  mimeType?: string;        // ✅ Available
  isPrimary?: boolean;      // ✅ Available
  status?: 'PENDING' | 'ANALYZED' | 'FAILED';  // ❌ Not in backend
  analysisResults?: any;    // ❌ Not in backend
  uploadedAt: string;       // ✅ Available
  createdAt?: string;       // ✅ Available
  updatedAt: string;        // ✅ Available
}
```

### Solution

The `status` and `analysisResults` fields are marked as optional (`?`) so the frontend can handle CVs that don't have analysis data.

If you want to add CV analysis features in the future, you'll need to:

1. Add fields to the backend CV entity:
```typescript
@Column({ type: 'enum', enum: ['PENDING', 'ANALYZED', 'FAILED'], default: 'PENDING' })
@Field(() => String)
status: 'PENDING' | 'ANALYZED' | 'FAILED';

@Column({ type: 'json', nullable: true })
@Field({ nullable: true })
analysisResults?: any;
```

2. Create a CV analysis service
3. Process CVs after upload
4. Store analysis results in the database

---

## Issue 3: Data Access Pattern

### Current Pattern (Workaround)

```
1. Query me { id }
   ↓
2. Query candidateProfileByUser(userId) { cvs { ... } }
   ↓
3. Return CVs
```

**Pros:**
- ✅ Works with current backend schema
- ✅ No backend changes required

**Cons:**
- ❌ Requires two queries instead of one
- ❌ More network round trips
- ❌ Higher latency
- ❌ More complex client code

### Ideal Pattern (After Backend Fix)

```
1. Query me { candidateProfile { cvs { ... } } }
   ↓
2. Return CVs
```

**Pros:**
- ✅ Single query
- ✅ Less network overhead
- ✅ Simpler client code
- ✅ Better performance

**Cons:**
- ❌ Requires backend changes

---

## Query Examples

### Current Working Query (Two-Step)

```graphql
# Step 1: Get user ID
query GetUserId {
  me {
    id
  }
}

# Step 2: Get CVs using user ID
query GetCandidateCVs($userId: ID!) {
  candidateProfileByUser(userId: $userId) {
    id
    cvs {
      id
      fileName
      fileUrl
      fileSize
      mimeType
      isPrimary
      uploadedAt
      createdAt
      updatedAt
    }
  }
}
```

### Ideal Query (After Backend Fix)

```graphql
# Single query to get everything
query GetMyCVs {
  me {
    id
    name
    email
    avatar
    candidateProfile {
      id
      firstName
      lastName
      cvs {
        id
        fileName
        fileUrl
        fileSize
        mimeType
        isPrimary
        uploadedAt
        createdAt
        updatedAt
      }
    }
  }
}
```

---

## Files Modified

### Frontend Workarounds Implemented

1. **`src/services/cv.ts`**
   - ✅ Updated `getCVs()` to use two-step query
   - ✅ Added `GET_USER_ID_QUERY` for fetching user ID
   - ✅ Updated `GET_CVS_QUERY` to use `candidateProfileByUser`
   - ✅ Updated `CVData` interface to match backend fields

2. **`src/services/savedJobs.ts`**
   - ✅ Already using correct query structure
   - ✅ No changes needed

---

## Testing Checklist

### ✅ Current Implementation (Workaround)
- [x] CV query works with two-step approach
- [x] CVs are fetched correctly for authenticated users
- [x] No errors from GraphQL validation
- [x] Optional fields handled gracefully

### 🔲 After Backend Fix (Recommended)
- [ ] Update frontend to use single-step query
- [ ] Remove `GET_USER_ID_QUERY`
- [ ] Simplify `getCVs()` method
- [ ] Test performance improvement
- [ ] Verify all CV data is returned correctly

---

## Backend Implementation Priority

### High Priority
1. **Add candidateProfile to UserDto** - This affects multiple features
2. **Update me query resolver** - Include candidateProfile relations
3. **Test with existing frontend code** - Ensure backward compatibility

### Medium Priority
4. **Add CV analysis fields** (status, analysisResults) - Only if analysis feature is planned
5. **Create CV analysis service** - Background job to process CVs
6. **Add analysis webhook/polling** - Update status when analysis completes

### Low Priority
7. **Optimize CV queries** - Add DataLoader for N+1 prevention
8. **Add CV pagination** - If users can have many CVs
9. **Add CV versioning** - Track CV history

---

## Summary

The frontend now works correctly with the current backend schema limitations by:

1. ✅ Using two-step queries to fetch CVs (workaround)
2. ✅ Marking optional fields that don't exist in backend
3. ✅ Handling missing data gracefully with fallbacks
4. ✅ Providing clear error messages

**Recommended Backend Changes:**
- Add `candidateProfile` field to `UserDto`
- Update `me` query to include candidate profile relations
- This will improve performance and simplify frontend code

**Optional Backend Enhancements:**
- Add CV analysis fields (`status`, `analysisResults`)
- Create CV analysis service
- Add CV processing pipeline
