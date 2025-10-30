# CV Management System - Complete Documentation

## Overview

The CV management system in Rolevate handles the uploading, storage, and retrieval of candidate resumes/CVs. It's designed to automatically create CV records in the database when a resume URL is set on a candidate profile.

## Architecture

### Key Components

1. **CandidateProfile Entity** - Main profile for a candidate user
   - Has a one-to-many relationship with CV records
   - Stores `resumeUrl` field (primary resume)
   - Related entity: `User`

2. **CV Entity** - Individual CV record
   - Belongs to a CandidateProfile
   - Stores file metadata (fileName, fileUrl, fileSize, mimeType)
   - Can mark one CV as `isPrimary` (active resume)

3. **AWS S3 Service** - File storage
   - Uploads CV files to S3 bucket
   - Returns presigned URLs for downloads
   - Organizes files in `cvs/{candidateId}/` folder

4. **CandidateProfileService** - Business logic
   - Creates/updates candidate profiles
   - Automatically creates CV records when resumeUrl is set
   - Manages CV relationships

### Database Schema

```sql
-- Candidate Profile Table
CREATE TABLE "candidate_profile" (
  "id" uuid PRIMARY KEY,
  "userId" uuid NOT NULL UNIQUE,
  "name" varchar,
  "phone" varchar,
  "location" varchar,
  "bio" text,
  "skills" text array,
  "experience" varchar,
  "education" varchar,
  "resumeUrl" varchar,  -- Primary resume URL
  "linkedinUrl" varchar,
  "githubUrl" varchar,
  "portfolioUrl" varchar,
  "availability" enum,
  "salaryExpectation" varchar,
  "preferredWorkType" enum,
  "createdAt" timestamp,
  "updatedAt" timestamp,
  FOREIGN KEY ("userId") REFERENCES "user"("id")
);

-- CV Table
CREATE TABLE "cv" (
  "id" uuid PRIMARY KEY,
  "candidateProfileId" uuid NOT NULL,
  "fileName" varchar NOT NULL,
  "fileUrl" varchar NOT NULL,
  "fileSize" int,
  "mimeType" varchar,
  "isPrimary" boolean DEFAULT false,
  "uploadedAt" timestamp,
  "createdAt" timestamp,
  "updatedAt" timestamp,
  FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profile"("id")
);
```

## Workflow

### 1. Creating a Candidate User (New Signup)

When a candidate user signs up, the system automatically creates:
- User account
- Empty CandidateProfile

**Flow:**
```
User Creation (createUser mutation)
    ↓
[if userType === CANDIDATE]
    ↓
Auto-create empty CandidateProfile
```

**GraphQL Mutation:**
```graphql
mutation {
  createUser(input: {
    userType: CANDIDATE
    email: "candidate@example.com"
    password: "secure_password"
    name: "John Doe"
    phone: "+1234567890"
  }) {
    id
    email
    userType
  }
}
```

**Backend Logic (UserService.create):**
```typescript
// In user.service.ts
async create(userType: UserType, email?: string, password?: string, name?: string, phone?: string): Promise<User> {
  // Create user
  const savedUser = await this.userRepository.save(user);
  
  // Auto-create candidate profile if CANDIDATE type
  if (userType === UserType.CANDIDATE) {
    const candidateProfile = this.candidateProfileRepository.create({
      userId: savedUser.id,
      name: name,
      phone: phone,
      skills: [],
    });
    await this.candidateProfileRepository.save(candidateProfile);
  }
  
  return savedUser;
}
```

### 2. Uploading a CV File

The CV upload process involves two steps:

#### Step 1: Upload file to S3

**GraphQL Mutation:**
```graphql
mutation {
  uploadCVToS3(
    base64File: "JVBERi0xLjQKJeLj..."  # Base64 encoded file
    filename: "AlHussein_Resume_21.pdf"
    mimetype: "application/pdf"
    candidateId: "76bb5466-beef-411e-acb8-ca2490240717"
  ) {
    url: "https://bucket.s3.region.amazonaws.com/cvs/76bb5466-.../file.pdf"
    key: "cvs/76bb5466-.../file.pdf"
    bucket: "bucket-name"
  }
}
```

**What happens:**
1. Base64 file is decoded to binary
2. Uploaded to S3 under `cvs/{candidateId}/{uuid}-{filename}`
3. Returns S3 URL and object key

#### Step 2: Update candidate profile with resume URL

**GraphQL Mutation:**
```graphql
mutation {
  updateCandidateProfile(
    id: "76bb5466-beef-411e-acb8-ca2490240717"
    input: {
      resumeUrl: "https://bucket.s3.region.amazonaws.com/cvs/76bb5466-.../0fff25db-AlHussein_Resume_21.pdf"
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

**What happens:**
1. Updates the `resumeUrl` field on the profile
2. **Automatically creates a CV record** with:
   - `candidateProfileId`: Profile ID
   - `fileName`: Extracted from URL
   - `fileUrl`: The S3 URL
   - `isPrimary`: false (user can activate later)

**Backend Logic (CandidateProfileService.update):**
```typescript
async update(id: string, updateCandidateProfileInput: UpdateCandidateProfileInput): Promise<CandidateProfile | null> {
  // Update profile
  await this.candidateProfileRepository.update(id, updateCandidateProfileInput);
  
  // If resumeUrl is set, create CV record automatically
  if (updateCandidateProfileInput.resumeUrl) {
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
  
  return this.findOne(id);
}
```

### 3. Retrieving Candidate Profile with CVs

**GraphQL Query:**
```graphql
query {
  candidateProfileByUser(userId: "bc9e4454-52f3-4705-9356-42d3b50d5a18") {
    id
    name
    phone
    location
    bio
    skills
    experience
    education
    resumeUrl
    cvs {
      id
      fileName
      fileUrl
      fileSize
      mimeType
      isPrimary
      uploadedAt
    }
    workExperiences {
      id
      position
      company
      startDate
      endDate
      isCurrent
      description
    }
    educations {
      id
      degree
      institution
      fieldOfStudy
      startDate
      endDate
      grade
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "candidateProfileByUser": {
      "id": "76bb5466-beef-411e-acb8-ca2490240717",
      "name": "Al Hussein",
      "phone": "+966501234567",
      "location": "Riyadh, Saudi Arabia",
      "bio": "Full Stack Developer",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "experience": "5 years",
      "education": "BS Computer Science",
      "resumeUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/76bb5466-beef-411e-acb8-ca2490240717/0fff25db-AlHussein_Resume_21.pdf",
      "cvs": [
        {
          "id": "cv-uuid-1",
          "fileName": "0fff25db-AlHussein_Resume_21.pdf",
          "fileUrl": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/76bb5466-beef-411e-acb8-ca2490240717/0fff25db-AlHussein_Resume_21.pdf",
          "fileSize": 245678,
          "mimeType": "application/pdf",
          "isPrimary": false,
          "uploadedAt": "2025-10-30T12:00:00Z"
        }
      ],
      "workExperiences": [],
      "educations": []
    }
  }
}
```

## Input Types

### CreateCandidateProfileInput

```typescript
@InputType()
export class CreateCandidateProfileInput {
  @Field()
  userId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field({ nullable: true })
  experience?: string;

  @Field({ nullable: true })
  education?: string;

  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field({ nullable: true })
  githubUrl?: string;

  @Field({ nullable: true })
  portfolioUrl?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field(() => AvailabilityStatus, { nullable: true })
  availability?: AvailabilityStatus;

  @Field({ nullable: true })
  salaryExpectation?: string;

  @Field(() => WorkType, { nullable: true })
  preferredWorkType?: WorkType;
}
```

### UpdateCandidateProfileInput

Same fields as CreateCandidateProfileInput but all optional.

## Important Notes

### 1. Automatic CV Record Creation

When you call `updateCandidateProfile` with a `resumeUrl`:

```
updateCandidateProfile(
  id: "profile-id",
  input: { resumeUrl: "s3-url" }
)
  ↓
Profile updated with resumeUrl
  ↓
CV record automatically created with:
  - candidateProfileId: profile-id
  - fileName: extracted from URL
  - fileUrl: s3-url
  - isPrimary: false
  ↓
Profile query now returns cvs array
```

### 2. Multiple CVs

A candidate can have multiple CV records:
- Each upload creates a new CV record
- Only one can be marked as `isPrimary`
- Use `activateCV` mutation to make a CV primary

**GraphQL Mutation (Activate CV):**
```graphql
mutation {
  activateCV(id: "cv-uuid") 
}
```

### 3. Deduplicate CVs

The system checks if a CV with the same URL already exists before creating:

```typescript
const existingCV = await this.cvRepository.findOne({
  where: {
    candidateProfileId: id,
    fileUrl: updateCandidateProfileInput.resumeUrl,
  },
});

if (!existingCV) {
  // Create new CV record
}
```

This prevents duplicate CV records for the same file.

## Troubleshooting

### Problem: CVs array is empty

**Cause:** CV records not created in database

**Solution:**
1. Verify `updateCandidateProfile` was called with `resumeUrl`
2. Check CV table for records with matching `candidateProfileId`
3. Ensure `CandidateProfileService.update` is being used
4. Check logs for CV creation errors

**Debug Query:**
```sql
SELECT * FROM "cv" WHERE "candidateProfileId" = 'profile-uuid';
```

### Problem: resumeUrl set but no CVs

**Cause:** Update happened before code changes

**Solution:** Re-update the profile with the same resumeUrl:

```graphql
mutation {
  updateCandidateProfile(
    id: "profile-id"
    input: { resumeUrl: "s3-url" }
  ) {
    id
    cvs { id fileName }
  }
}
```

### Problem: Duplicate CVs

**Cause:** Multiple updates with same URL

**Solution:** Already handled - system deduplicates before creating

## File Upload Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                              │
│  1. User selects CV file                                   │
│  2. Convert to base64                                      │
│  3. Call uploadCVToS3 mutation                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL API (Backend)                    │
│                                                              │
│  uploadCVToS3 Resolver:                                    │
│  - Decode base64 to binary                                │
│  - Call AwsS3Service.uploadCV()                           │
│  - Return S3 URL                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      AWS S3 Bucket                          │
│                                                              │
│  Store file at:                                            │
│  cvs/{candidateId}/{uuid}-{filename}                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                              │
│  4. Receive S3 URL from uploadCVToS3                       │
│  5. Call updateCandidateProfile with resumeUrl             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL API (Backend)                    │
│                                                              │
│  updateCandidateProfile Resolver:                          │
│  - Update profile.resumeUrl                               │
│  - CandidateProfileService.update():                       │
│    * Update database                                       │
│    * Extract fileName from URL                            │
│    * Create CV record automatically                       │
│    * Return updated profile with cvs array               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│                                                              │
│  candidate_profile table:                                  │
│  - resumeUrl updated                                       │
│                                                              │
│  cv table:                                                 │
│  - New CV record created with:                            │
│    * candidateProfileId                                   │
│    * fileName (from URL)                                  │
│    * fileUrl (S3 URL)                                     │
│    * isPrimary: false                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                              │
│  6. Receive updated profile with cvs array                 │
│  7. Display CVs in UI                                      │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### CV Query Optimization

The `findByUserId` method loads all relations:

```typescript
async findByUserId(userId: string): Promise<CandidateProfile | null> {
  return this.candidateProfileRepository.findOne({
    where: { userId },
    relations: ['user', 'workExperiences', 'educations', 'cvs'],
  });
}
```

For large datasets, consider adding pagination or selective loading:

```typescript
// Option 1: Lazy load CVs separately
const profile = await this.candidateProfileRepository.findOne({
  where: { userId },
  relations: ['user'],
});

const cvs = await this.cvRepository.find({
  where: { candidateProfileId: profile.id }
});

// Option 2: Add pagination to CVs
const cvs = await this.cvRepository.find({
  where: { candidateProfileId: profile.id },
  take: 10,
  skip: 0,
  order: { uploadedAt: 'DESC' },
});
```

## Best Practices

1. **Always upload to S3 first** before updating profile
2. **Use transactions** when creating profiles and CVs together
3. **Validate file types** (PDF, DOCX, etc.) before upload
4. **Set reasonable file size limits** (e.g., 10MB max)
5. **Keep S3 URLs immutable** - don't modify stored URLs
6. **Use presigned URLs** for temporary access
7. **Archive old CVs** instead of deleting
8. **Log all CV operations** for audit trail

## Related Entities

### User Entity
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  userType: UserType; // CANDIDATE, BUSINESS, ADMIN

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @OneToOne(() => CandidateProfile)
  candidateProfile: CandidateProfile;
}
```

### CandidateProfile Entity
```typescript
@Entity()
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  user: User;

  @Column({ nullable: true })
  resumeUrl: string;

  @OneToMany(() => CV, cv => cv.candidateProfile)
  cvs: CV[];

  @OneToMany(() => WorkExperience, exp => exp.candidateProfile)
  workExperiences: WorkExperience[];

  @OneToMany(() => Education, edu => edu.candidateProfile)
  educations: Education[];
}
```

### CV Entity
```typescript
@Entity()
export class CV {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateProfileId: string;

  @ManyToOne(() => CandidateProfile, profile => profile.cvs)
  candidateProfile: CandidateProfile;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}
```

## Summary

The CV management system automates CV record creation when resume URLs are set on candidate profiles. This ensures:

✅ No duplicate CV records
✅ Consistent data structure
✅ Easy retrieval of candidate CVs
✅ Support for multiple CVs per candidate
✅ Audit trail of uploads
✅ Secure S3 storage

For questions or issues, refer to the troubleshooting section or check the application logs.
