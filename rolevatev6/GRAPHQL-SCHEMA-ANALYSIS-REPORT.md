# GraphQL Schema Analysis & Improvement Report

**Generated:** 2025-01-19
**Project:** Rolevate Platform
**Backend:** NestJS + GraphQL + TypeORM
**Frontend:** Next.js 15 + Apollo Client

---

## 📊 Executive Summary

**Overall Status:** ⚠️ **Good Foundation with Missing Features**

Your GraphQL schema is well-structured with proper entities, relationships, and type safety. However, there are **several critical missing features** that the frontend expects but the backend doesn't implement.

### Quick Stats
- ✅ **Implemented Modules:** 15
- ✅ **Core Entities:** 20+
- ⚠️ **Missing Features:** 8
- ⚠️ **Incomplete Resolvers:** 4
- 🔴 **Critical Gaps:** 3

---

## 🔴 Critical Missing Features

### 1. **Saved Jobs Feature** - NOT IMPLEMENTED
**Status:** ❌ **MISSING ENTIRELY**

**Frontend Expects:**
```typescript
// src/services/savedJobs.ts
getSavedJobsDetails(jobIds: string[]): Promise<Job[]>
```

**Backend Status:** ❌ No entity, no resolver, no service

**Impact:** HIGH - Feature completely broken in production

**Recommendation:**
Create a `SavedJob` entity and implement:
```graphql
type SavedJob {
  id: ID!
  userId: ID!
  jobId: ID!
  savedAt: DateTime!
  job: Job!
  user: User!
}

# Queries
savedJobs(userId: ID!): [SavedJob!]!
isSaved(userId: ID!, jobId: ID!): Boolean!

# Mutations
saveJob(jobId: ID!): SavedJob!
unsaveJob(jobId: ID!): Boolean!
```

**Priority:** 🔴 **CRITICAL**

---

### 2. **Password Change** - NOT IMPLEMENTED
**Status:** ❌ **MISSING**

**Frontend Expects:**
```typescript
// src/services/company.service.ts (line 286)
changePassword(currentPassword: string, newPassword: string): Promise<void>
```

**Backend Status:** ❌ No mutation available

**Recommendation:**
```graphql
# Add to User/Auth resolver
type Mutation {
  changePassword(
    currentPassword: String!
    newPassword: String!
  ): Boolean!
}
```

**Priority:** 🟡 **HIGH**

---

### 3. **Notification Settings** - NOT IMPLEMENTED
**Status:** ❌ **MISSING**

**Frontend Expects:**
```typescript
// src/services/company.service.ts (line 274)
updateNotificationSettings(settings: NotificationSettings): Promise<void>

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  applicationUpdates: boolean
  interviewReminders: boolean
  systemAlerts: boolean
  weeklyReports: boolean
}
```

**Backend Status:** ❌ No entity, no resolver

**Recommendation:**
Create `UserSettings` or `NotificationPreferences` entity:
```graphql
type NotificationSettings {
  userId: ID!
  emailNotifications: Boolean!
  smsNotifications: Boolean!
  pushNotifications: Boolean!
  applicationUpdates: Boolean!
  interviewReminders: Boolean!
  systemAlerts: Boolean!
  weeklyReports: Boolean!
}

type Mutation {
  updateNotificationSettings(input: NotificationSettingsInput!): NotificationSettings!
}
```

**Priority:** 🟡 **MEDIUM**

---

## ⚠️ Incomplete Implementations

### 4. **Profile Service** - PARTIALLY IMPLEMENTED
**Status:** ⚠️ **INCOMPLETE**

**What Exists:**
- ✅ `CandidateProfile` entity
- ✅ Basic CRUD resolver
- ✅ `candidateProfileByUser` query

**What's Missing:**
```typescript
// Frontend expects (src/services/profile.ts)
ProfileService.getProfile(): Promise<CandidateProfile>
ProfileService.updateProfile(profile: Partial<CandidateProfile>): Promise<CandidateProfile>
```

**Backend Has:**
```graphql
# Current (requires ID)
candidateProfile(id: ID!): CandidateProfile
candidateProfileByUser(userId: ID!): CandidateProfile

# Missing convenience query
myProfile: CandidateProfile  # Auto-gets from JWT context
```

**Recommendation:**
Add to `CandidateProfileResolver`:
```graphql
type Query {
  myProfile: CandidateProfile  # Uses @Context() to get userId
}

type Mutation {
  updateMyProfile(input: UpdateCandidateProfileInput!): CandidateProfile!
}
```

**Priority:** 🟡 **HIGH**

---

### 5. **CV Management** - ENTITY EXISTS, NO RESOLVERS
**Status:** ⚠️ **INCOMPLETE**

**What Exists:**
- ✅ `CV` entity with fields
- ❌ No CV upload mutation
- ❌ No CV list query
- ❌ No CV delete mutation

**Recommendation:**
```graphql
type Query {
  myCVs: [CV!]!
  candidateCVs(candidateProfileId: ID!): [CV!]!
}

type Mutation {
  uploadCV(file: Upload!, candidateProfileId: ID!): CV!
  deleteCV(id: ID!): Boolean!
  setPrimaryCV(id: ID!): CV!
}
```

**Priority:** 🟡 **MEDIUM**

---

### 6. **Application Notes** - BASIC IMPLEMENTATION
**Status:** ⚠️ **BASIC**

**What Exists:**
- ✅ `ApplicationNote` entity
- ✅ Basic mutations

**What's Missing:**
```graphql
# Convenience queries
type Query {
  applicationNotes(applicationId: ID!): [ApplicationNote!]!  # ❌ MISSING
}
```

**Current Implementation:** Only has `createApplicationNote` and `updateApplicationNote`

**Priority:** 🟢 **LOW** (Can use through Application.notes relation)

---

## 🔍 Schema Structure Analysis

### ✅ Well-Implemented Modules

#### **Application Module** - ⭐ EXCELLENT
- ✅ Complete CRUD operations
- ✅ Filtering and pagination
- ✅ Status management
- ✅ CV analysis integration
- ✅ Anonymous applications support
- ✅ Role-based access control

#### **Job Module** - ⭐ EXCELLENT
- ✅ Complete job posting
- ✅ Company job listings
- ✅ Public job browsing
- ✅ Slug-based lookup
- ✅ Filtering and pagination

#### **Interview Module** - ⭐ EXCELLENT
- ✅ LiveKit integration
- ✅ Transcript management
- ✅ Interview scheduling
- ✅ Feedback submission
- ✅ Status transitions

#### **Company Module** - ⭐ EXCELLENT
- ✅ Company management
- ✅ Invitation system
- ✅ User association
- ✅ Logo upload

#### **Notification Module** - ✅ GOOD
- ✅ User notifications
- ✅ Mark as read
- ✅ Unread count
- ⚠️ Missing: Notification preferences

---

## 📋 Missing Queries & Mutations

### High Priority Additions

```graphql
# ===== SAVED JOBS =====
type SavedJob {
  id: ID!
  userId: ID!
  jobId: ID!
  job: Job!
  savedAt: DateTime!
}

extend type Query {
  mySavedJobs: [SavedJob!]!
  isSaved(jobId: ID!): Boolean!
}

extend type Mutation {
  saveJob(jobId: ID!): SavedJob!
  unsaveJob(jobId: ID!): Boolean!
}

# ===== USER PROFILE =====
extend type Query {
  myProfile: CandidateProfile  # Auto-detect from JWT
}

extend type Mutation {
  updateMyProfile(input: UpdateCandidateProfileInput!): CandidateProfile!
}

# ===== PASSWORD & SECURITY =====
extend type Mutation {
  changePassword(currentPassword: String!, newPassword: String!): Boolean!
  requestPasswordReset(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
}

# ===== NOTIFICATION SETTINGS =====
type NotificationSettings {
  userId: ID!
  emailNotifications: Boolean!
  smsNotifications: Boolean!
  pushNotifications: Boolean!
  applicationUpdates: Boolean!
  interviewReminders: Boolean!
  systemAlerts: Boolean!
  weeklyReports: Boolean!
  updatedAt: DateTime!
}

extend type Query {
  myNotificationSettings: NotificationSettings!
}

extend type Mutation {
  updateNotificationSettings(input: NotificationSettingsInput!): NotificationSettings!
}

# ===== CV MANAGEMENT =====
extend type Query {
  myCVs: [CV!]!
}

extend type Mutation {
  uploadCV(file: Upload!, isPrimary: Boolean): CV!
  deleteCV(id: ID!): Boolean!
  setPrimaryCV(id: ID!): CV!
}

# ===== WORK EXPERIENCE & EDUCATION =====
# These entities exist but no resolvers found
extend type Mutation {
  addWorkExperience(input: CreateWorkExperienceInput!): WorkExperience!
  updateWorkExperience(id: ID!, input: UpdateWorkExperienceInput!): WorkExperience!
  deleteWorkExperience(id: ID!): Boolean!

  addEducation(input: CreateEducationInput!): Education!
  updateEducation(id: ID!, input: UpdateEducationInput!): Education!
  deleteEducation(id: ID!): Boolean!
}
```

---

## 🏗️ Database Schema Improvements

### Missing Entities

#### 1. **SavedJob** Entity
```typescript
@Entity()
@ObjectType()
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  @Field(() => Job)
  job: Job;

  @CreateDateColumn()
  @Field()
  savedAt: Date;

  @Index(['userId', 'jobId'], { unique: true })
}
```

#### 2. **NotificationSettings** Entity
```typescript
@Entity()
@ObjectType()
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({ default: true })
  @Field()
  emailNotifications: boolean;

  @Column({ default: false })
  @Field()
  smsNotifications: boolean;

  @Column({ default: true })
  @Field()
  pushNotifications: boolean;

  @Column({ default: true })
  @Field()
  applicationUpdates: boolean;

  @Column({ default: true })
  @Field()
  interviewReminders: boolean;

  @Column({ default: true })
  @Field()
  systemAlerts: boolean;

  @Column({ default: false })
  @Field()
  weeklyReports: boolean;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
```

#### 3. **PasswordResetToken** Entity (Recommended)
```typescript
@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 🔐 Security Improvements

### 1. **Add Rate Limiting**
Currently no rate limiting visible in resolvers.

**Recommendation:**
```typescript
import { Throttle } from '@nestjs/throttler';

@Mutation(() => Boolean)
@Throttle(3, 60) // 3 attempts per minute
async changePassword(...) {}
```

### 2. **Password Validation**
```typescript
// Add password validation service
class PasswordValidator {
  validate(password: string): { valid: boolean; errors: string[] } {
    const errors = [];
    if (password.length < 8) errors.push('Minimum 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Requires uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Requires lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Requires number');
    return { valid: errors.length === 0, errors };
  }
}
```

### 3. **Audit Logging**
Add audit logs for sensitive operations:
- Password changes
- Profile updates
- Application status changes
- User role changes

---

## 📈 Performance Optimizations

### 1. **Add DataLoader for N+1 Queries**
Current implementation may have N+1 queries when fetching:
- Applications with Jobs
- Jobs with Companies
- Interviews with Applications

**Recommendation:** Implement DataLoader
```typescript
@ResolveField()
async job(@Parent() application: Application, @Loader('JobLoader') jobLoader: DataLoader<string, Job>) {
  return jobLoader.load(application.jobId);
}
```

### 2. **Add Pagination to All List Queries**
Some queries missing pagination:
- `interviews` - ⚠️ No pagination
- `candidateProfiles` - ⚠️ No pagination
- `companies` - ⚠️ No pagination

### 3. **Add Field-Level Permissions**
Use `@ResolveField()` guards for sensitive data:
```typescript
@ResolveField()
@UseGuards(FieldLevelGuard)
async resumeUrl(@Parent() application: Application, @Context() ctx) {
  // Only show resume to company or candidate
}
```

---

## 🎯 Quick Wins (Low Effort, High Impact)

### 1. **Add Convenience Queries** ⭐
```graphql
extend type Query {
  myApplications: [Application!]!     # Instead of applicationsByCandidate(candidateId)
  myCompanyJobs: [Job!]!              # Already exists as companyJobs
  myProfile: CandidateProfile         # Instead of candidateProfileByUser(userId)
  mySavedJobs: [SavedJob!]!           # NEW - requires implementation
}
```

### 2. **Add Aggregate Counts** ⭐
```graphql
type ApplicationStats {
  total: Int!
  pending: Int!
  reviewed: Int!
  shortlisted: Int!
  interviewed: Int!
  offered: Int!
  hired: Int!
  rejected: Int!
}

extend type Query {
  myApplicationStats: ApplicationStats!
  companyApplicationStats: ApplicationStats!
}
```

### 3. **Add Search Functionality** ⭐
```graphql
extend type Query {
  searchJobs(query: String!, filters: JobFilterInput): [Job!]!
  searchCandidates(query: String!): [CandidateProfile!]!
}
```

---

## 📊 Priority Implementation Roadmap

### 🔴 **Phase 1: Critical Gaps (Week 1)**
1. Saved Jobs feature (entity + resolver + service)
2. Password change mutation
3. myProfile convenience query
4. CV upload/management mutations

**Estimated Effort:** 3-4 days

### 🟡 **Phase 2: User Experience (Week 2)**
1. Notification settings
2. Work experience CRUD
3. Education CRUD
4. Aggregate stats queries

**Estimated Effort:** 3-4 days

### 🟢 **Phase 3: Enhancements (Week 3)**
1. Search functionality
2. Password reset flow
3. DataLoader optimization
4. Audit logging

**Estimated Effort:** 4-5 days

---

## ✅ What's Working Well

### Strengths
1. ✅ **Proper TypeORM + GraphQL integration** - Well-structured entities
2. ✅ **JWT Authentication** - Secure auth flow
3. ✅ **Role-based access** - Multiple guard types
4. ✅ **Application workflow** - Complete status management
5. ✅ **Company invitations** - Full invitation system
6. ✅ **Interview management** - LiveKit integration
7. ✅ **Type safety** - Proper GraphQL types and enums

### Best Practices Already Followed
- ✅ Input DTOs for all mutations
- ✅ Nullable types where appropriate
- ✅ UUID primary keys
- ✅ Timestamps on all entities
- ✅ Enum registration for GraphQL
- ✅ Proper relation decorators

---

## 🛠️ Implementation Templates

### Saved Jobs Module (Complete)

**1. Create Entity**
```bash
# In /src/saved-job/saved-job.entity.ts
```

**2. Create DTOs**
```bash
# create-saved-job.input.ts
# saved-job.dto.ts
```

**3. Create Service**
```bash
# saved-job.service.ts
```

**4. Create Resolver**
```bash
# saved-job.resolver.ts
```

**5. Create Module**
```bash
# saved-job.module.ts
```

**6. Register in AppModule**
```typescript
// src/app.module.ts
imports: [
  // ...
  SavedJobModule,
]
```

---

## 📝 Code Quality Recommendations

### 1. **Add Input Validation**
```typescript
import { IsNotEmpty, IsEmail, MinLength, IsEnum } from 'class-validator';

export class CreateUserInput {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserType)
  userType: UserType;
}
```

### 2. **Add Error Handling**
```typescript
try {
  // operation
} catch (error) {
  throw new GraphQLError('User-friendly message', {
    extensions: {
      code: 'CUSTOM_ERROR_CODE',
      originalError: error.message,
    },
  });
}
```

### 3. **Add API Documentation**
```typescript
@Mutation(() => Boolean, {
  description: 'Save a job to user\'s saved list',
})
@UseGuards(JwtAuthGuard)
async saveJob(
  @Args('jobId', { description: 'ID of the job to save' }) jobId: string,
  @Context() context: any,
): Promise<boolean> {
  // implementation
}
```

---

## 🎓 Next Steps

### Immediate Actions
1. **Create Saved Jobs module** - Follow implementation template above
2. **Add password change mutation** - Add to AuthResolver
3. **Add myProfile query** - Add to CandidateProfileResolver
4. **Update frontend services** - Remove TODO comments

### Medium Term
1. Implement notification settings
2. Add CV management
3. Add work experience/education CRUD
4. Implement search

### Long Term
1. Add DataLoader for performance
2. Implement audit logging
3. Add rate limiting
4. Add comprehensive testing

---

## 📞 Summary

**Overall Grade:** B+ (Good foundation, missing some features)

**Strengths:**
- Well-structured GraphQL schema
- Proper authentication and authorization
- Good entity relationships
- Type-safe implementation

**Areas for Improvement:**
- Missing saved jobs feature (CRITICAL)
- No password change (HIGH)
- No notification settings (MEDIUM)
- Incomplete profile management (MEDIUM)

**Recommended First Steps:**
1. Implement Saved Jobs (3-4 hours)
2. Add password change (1-2 hours)
3. Add myProfile convenience queries (30 minutes)
4. Update frontend to remove TODOs

---

**Report Generated By:** Claude Code
**Date:** January 19, 2025
**Schema Version:** Current (as of analysis)
