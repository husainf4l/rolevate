# CV Management Implementation Checklist

## Quick Start for Developers

### Setup Steps

- [x] **Database Schema** - CV table created with proper relationships
  - Location: `src/migrations/1761777283148-InitialSchema.ts`
  - Table: `cv`
  - Foreign key: `candidateProfileId` → `candidate_profile.id`

- [x] **CV Entity** - TypeORM entity defined
  - Location: `src/candidate/cv.entity.ts`
  - Fields: id, candidateProfileId, fileName, fileUrl, fileSize, mimeType, isPrimary, uploadedAt

- [x] **CandidateProfile Entity** - One-to-many relationship with CV
  - Location: `src/candidate/candidate-profile.entity.ts`
  - Relation: `@OneToMany(() => CV, cv => cv.candidateProfile) cvs: CV[]`

- [x] **Module Imports** - CV registered in TypeOrmModule
  - Location: `src/candidate/candidate.module.ts`
  - Import: `TypeOrmModule.forFeature([CandidateProfile, WorkExperience, Education, CV])`

### Service Layer

- [x] **CandidateProfileService** - Handles automatic CV creation
  - Location: `src/candidate/candidate-profile.service.ts`
  - Method: `update()` - Creates CV record when `resumeUrl` is set
  - Features:
    - Automatic filename extraction from URL
    - Deduplication check (prevents duplicate CVs for same URL)
    - Error handling (non-blocking if CV creation fails)

### Resolver Layer

- [x] **CandidateProfileResolver** - GraphQL mutations and queries
  - Location: `src/candidate/candidate-profile.resolver.ts`
  - Mutations:
    - `createCandidateProfile` - Creates new profile
    - `updateCandidateProfile` - Updates profile (triggers CV creation)
    - `deleteCV` - Removes CV record
    - `activateCV` - Makes a CV primary
  - Queries:
    - `candidateProfileByUser` - Retrieves profile with CVs (relations loaded)

### User Service Enhancement

- [x] **Auto-profile Creation** - When candidate signs up
  - Location: `src/user/user.service.ts`
  - Trigger: `create()` method when `userType === CANDIDATE`
  - Action: Creates empty CandidateProfile automatically

- [x] **Module Dependencies** - Added CandidateProfile entity
  - Location: `src/user/user.module.ts`
  - Import: `TypeOrmModule.forFeature([User, ApiKey, CandidateProfile])`

## Code Changes Summary

### 1. UserService - Auto-create CandidateProfile on signup

**File:** `src/user/user.service.ts`

```typescript
// Added to imports
import { CandidateProfile } from '../candidate/candidate-profile.entity';

// Added to constructor
@InjectRepository(CandidateProfile)
private candidateProfileRepository: Repository<CandidateProfile>,

// Modified create() method
async create(userType: UserType, email?: string, password?: string, name?: string, phone?: string): Promise<User> {
  // ... user creation code ...
  
  // Auto-create candidate profile if user type is CANDIDATE
  if (userType === UserType.CANDIDATE) {
    try {
      const candidateProfile = this.candidateProfileRepository.create({
        userId: savedUser.id,
        name: name,
        phone: phone,
        skills: [],
      });
      await this.candidateProfileRepository.save(candidateProfile);
      this.logger.log(`Candidate profile created automatically for user ${savedUser.id}`);
    } catch (error) {
      this.logger.error(`Failed to create candidate profile for user ${savedUser.id}:`, error);
    }
  }
  
  return savedUser;
}
```

**Changes:**
- Added CandidateProfile repository injection
- Added profile creation logic after user creation
- Non-blocking error handling

### 2. UserModule - Register CandidateProfile entity

**File:** `src/user/user.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey, CandidateProfile]),  // Added CandidateProfile
    JwtModule.registerAsync({ /* ... */ }),
  ],
  // ...
})
export class UserModule {}
```

**Changes:**
- Added CandidateProfile to TypeOrmModule.forFeature()
- Allows UserService to inject CandidateProfileRepository

### 3. CandidateProfileService - Auto-create CV on resume upload

**File:** `src/candidate/candidate-profile.service.ts`

```typescript
// Added to imports
import { CV } from './cv.entity';

// Added to constructor
@InjectRepository(CV)
private cvRepository: Repository<CV>,

// Modified update() method
async update(id: string, updateCandidateProfileInput: UpdateCandidateProfileInput): Promise<CandidateProfile | null> {
  await this.candidateProfileRepository.update(id, updateCandidateProfileInput);
  
  // If resumeUrl is being set, create CV record
  if (updateCandidateProfileInput.resumeUrl) {
    try {
      // Check if CV already exists for this URL
      const existingCV = await this.cvRepository.findOne({
        where: {
          candidateProfileId: id,
          fileUrl: updateCandidateProfileInput.resumeUrl,
        },
      });

      if (!existingCV) {
        // Extract filename from URL
        const urlParts = updateCandidateProfileInput.resumeUrl.split('/');
        const fileName = urlParts[urlParts.length - 1] || 'resume.pdf';

        // Create CV record
        const cv = this.cvRepository.create({
          candidateProfileId: id,
          fileName: fileName,
          fileUrl: updateCandidateProfileInput.resumeUrl,
          isPrimary: false,
        });
        await this.cvRepository.save(cv);
      }
    } catch (error) {
      console.error(`Failed to create CV record for profile ${id}:`, error);
    }
  }

  return this.findOne(id);
}
```

**Changes:**
- Added CV repository injection
- Added logic to create CV record when resumeUrl is set
- Deduplication check (prevents duplicate CVs for same URL)
- Filename extraction from S3 URL
- Non-blocking error handling

## Testing the Implementation

### Test 1: Create Candidate User

```graphql
mutation {
  createUser(input: {
    userType: CANDIDATE
    email: "test@example.com"
    password: "Test@1234"
    name: "Test Candidate"
    phone: "+1234567890"
  }) {
    id
    email
    userType
  }
}
```

**Expected:**
- User created with CANDIDATE type
- CandidateProfile automatically created in background
- Can query `candidateProfileByUser` with returned userId

### Test 2: Upload CV

**Step 1:** Upload file to S3
```graphql
mutation {
  uploadCVToS3(
    base64File: "..." # Base64 encoded file
    filename: "resume.pdf"
    mimetype: "application/pdf"
    candidateId: "{userId_from_test_1}"
  ) {
    url
    key
    bucket
  }
}
```

**Step 2:** Update profile with resume URL
```graphql
mutation {
  updateCandidateProfile(
    id: "{candidateProfileId}"
    input: {
      resumeUrl: "{url_from_step_1}"
    }
  ) {
    id
    resumeUrl
    cvs {
      id
      fileName
      fileUrl
      isPrimary
    }
  }
}
```

**Expected:**
- Profile updated with resumeUrl
- CV record automatically created
- CVs array should contain 1 record with the uploaded file

### Test 3: Query Profile with CVs

```graphql
query {
  candidateProfileByUser(userId: "{userId_from_test_1}") {
    id
    name
    phone
    resumeUrl
    cvs {
      id
      fileName
      fileUrl
      fileSize
      isPrimary
      uploadedAt
    }
  }
}
```

**Expected:**
- CVs array populated with CV records
- Each CV has correct fileName, fileUrl, etc.
- isPrimary defaults to false

## Troubleshooting

### Issue: CVs array returns empty

**Symptoms:**
- Profile retrieved successfully
- resumeUrl is set
- But cvs array is empty

**Solutions:**

1. **Check if profile update trigger worked:**
   ```sql
   SELECT * FROM cv WHERE "candidateProfileId" = 'profile-uuid';
   ```

2. **Verify CandidateProfileService.update is being called:**
   - Check application logs for "Failed to create CV record" errors
   - Ensure updateCandidateProfile resolver calls service method

3. **Re-trigger CV creation:**
   ```graphql
   mutation {
     updateCandidateProfile(
       id: "profile-uuid"
       input: { resumeUrl: "same-url" }
     ) {
       cvs { id fileName }
     }
   }
   ```

4. **Check for deduplication:**
   - If same URL already exists, no new CV is created
   - This is by design to prevent duplicates

### Issue: Auto-profile creation not working

**Symptoms:**
- Created CANDIDATE user
- candidateProfileByUser returns null or error

**Solutions:**

1. **Check logs for errors:**
   - Look for "Failed to create candidate profile" in logs
   - Verify UserService.create is catching errors properly

2. **Verify module imports:**
   - Check UserModule has CandidateProfile in TypeOrmModule.forFeature()
   - Ensure UserService has cvRepository injected

3. **Check database constraints:**
   ```sql
   SELECT * FROM candidate_profile WHERE "userId" = 'user-uuid';
   ```

4. **Force profile creation:**
   ```graphql
   mutation {
     createCandidateProfile(input: {
       userId: "user-uuid"
     }) {
       id
       userId
     }
   }
   ```

### Issue: Duplicate CVs created

**Symptoms:**
- Multiple CV records for same file
- UI shows duplicate CVs

**Solutions:**

1. **This shouldn't happen** - deduplication is implemented
2. **If it does, delete duplicates:**
   ```sql
   DELETE FROM cv WHERE id IN (
     SELECT id FROM cv WHERE "candidateProfileId" = 'profile-uuid'
     ORDER BY "createdAt" DESC OFFSET 1
   );
   ```

3. **Report as bug** - check application logs and implementation

## Database Verification Commands

```sql
-- Check candidate profiles
SELECT cp.id, cp."userId", cp."resumeUrl", u.email, COUNT(cv.id) as cv_count
FROM candidate_profile cp
JOIN "user" u ON cp."userId" = u.id
LEFT JOIN cv ON cv."candidateProfileId" = cp.id
GROUP BY cp.id, u.email;

-- Check CVs for a candidate
SELECT * FROM cv WHERE "candidateProfileId" = 'profile-uuid' ORDER BY "createdAt" DESC;

-- Find orphaned CVs (should be none)
SELECT * FROM cv WHERE "candidateProfileId" NOT IN (SELECT id FROM candidate_profile);

-- Check resume URLs set but no CVs
SELECT cp.id, cp."resumeUrl", COUNT(cv.id) as cv_count
FROM candidate_profile cp
LEFT JOIN cv ON cv."candidateProfileId" = cp.id
WHERE cp."resumeUrl" IS NOT NULL
GROUP BY cp.id
HAVING COUNT(cv.id) = 0;
```

## Files Modified

1. ✅ `src/user/user.service.ts` - Added auto-profile creation
2. ✅ `src/user/user.module.ts` - Added CandidateProfile import
3. ✅ `src/candidate/candidate-profile.service.ts` - Added auto-CV creation
4. 📄 `src/candidate/candidate.module.ts` - No changes (already had CV)
5. 📄 `src/candidate/cv.entity.ts` - No changes (already defined)

## Files Unchanged (Already Correct)

- ✅ `src/candidate/candidate-profile.entity.ts` - Has cvs relation
- ✅ `src/candidate/candidate-profile.resolver.ts` - Loads cvs in queries
- ✅ `src/services/aws-s3.resolver.ts` - Uploads files correctly
- ✅ `src/services/aws-s3.service.ts` - Returns S3 URLs correctly

## Performance Impact

- **Minimal** - CV creation only happens when resumeUrl is set
- **Queries** - Relations loaded eagerly (consider lazy loading for large datasets)
- **Storage** - CV records are lightweight (only metadata, not file content)

## Next Steps

1. ✅ Test all three test cases above
2. ✅ Verify CVs appear in UI after upload
3. ✅ Test duplicate prevention
4. ✅ Monitor logs for any errors
5. 🔄 Consider adding batch CV operations (if needed)
6. 🔄 Consider adding presigned URLs for temporary access
7. 🔄 Consider adding CV versioning/archiving

## Summary

The CV management system is now fully operational:

- ✅ Automatic CandidateProfile creation on signup
- ✅ Automatic CV record creation when resume uploaded
- ✅ Duplicate prevention via URL check
- ✅ Proper database relationships
- ✅ GraphQL queries with eager loading
- ✅ Error handling and logging

The implementation ensures no manual CV record creation is needed - it all happens automatically when resume URLs are set on profiles.
