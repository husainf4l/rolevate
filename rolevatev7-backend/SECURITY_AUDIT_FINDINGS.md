# CRITICAL SECURITY ISSUES FOUND

## Summary
Multiple GraphQL endpoints are completely unprotected and expose sensitive data to unauthenticated users and wrong user types.

## Critical Issues Found

### 1. Candidate Profile Endpoints (CRITICAL - FIXED ✓)
**File:** `src/candidate/candidate-profile.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `candidateProfiles` | Lists ALL candidate profiles - ANY USER CAN ACCESS | ✓ FIXED |
| `candidateProfile(id)` | Gets specific profile - ANY USER CAN ACCESS | ✓ FIXED |
| `candidateProfileByUser(userId)` | Gets profile by user - ANY USER CAN ACCESS | ✓ FIXED |
| `createCandidateProfile` | Creates profile - ANY USER CAN CREATE | ✓ FIXED |

**Fix Applied:**
- `candidateProfiles` - NOW: ADMIN/SYSTEM only
- `candidateProfile(id)` - NOW: ADMIN/SYSTEM only
- `candidateProfileByUser(userId)` - NOW: Only own profile or ADMIN/SYSTEM
- `createCandidateProfile` - NOW: ADMIN/SYSTEM only

---

### 2. Company Endpoints (HIGH RISK - TODO)
**File:** `src/company/company.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `companies` | Lists ALL companies - ANY USER CAN ACCESS | TODO |
| `company(id)` | Gets specific company - ANY USER CAN ACCESS | TODO |
| `companiesByUser(userId)` | Gets user's companies - ANY USER CAN ACCESS | TODO |
| `updateCompany` | Updates company - NO GUARD | TODO |
| `removeCompany` | Deletes company - NO GUARD | TODO |

**Recommendation:**
- `companies` - Make public for discovery OR require auth
- `company(id)` - Make public for discovery OR require auth
- `companiesByUser(userId)` - Require auth, only own companies or admin
- `updateCompany` - Require BUSINESS/ADMIN role for ownership
- `removeCompany` - Require ADMIN/SYSTEM role

---

### 3. Interview Endpoints (HIGH RISK - TODO)
**File:** `src/interview/interview.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `interviews` | Lists ALL interviews - ANY USER CAN ACCESS | TODO |
| `interview(id)` | Gets specific interview - ANY USER CAN ACCESS | TODO |
| `interviewsByApplication` | Gets interviews for app - UNPROTECTED | TODO |
| `interviewsByInterviewer` | Gets user's interviews - UNPROTECTED | TODO |

**Recommendation:**
- All interview endpoints - Require auth
- Add authorization checks for ownership

---

### 4. Communication Endpoints (HIGH RISK - TODO)
**File:** `src/communication/communication.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `communications` | Lists ALL communications - ANY USER CAN ACCESS | TODO |
| `communication(id)` | Gets specific message - ANY USER CAN ACCESS | TODO |
| `communicationsByApplication` | Gets app messages - UNPROTECTED | TODO |
| `communicationsByUser` | Gets user messages - UNPROTECTED | TODO |

**Recommendation:**
- All endpoints - Require authentication
- Add authorization to check ownership

---

### 5. Database Backup Endpoints (CRITICAL - TODO)
**File:** `src/database-backup/database-backup.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `listDatabaseBackups` | Lists backups - ANY USER CAN ACCESS | TODO |
| `getDatabaseBackup` | Gets backup - ANY USER CAN ACCESS | TODO |
| `createDatabaseBackup` | Creates backup - ANY USER CAN CREATE | TODO |
| `restoreDatabaseFromBackup` | Restores DB - ANY USER CAN RESTORE | TODO |
| `deleteDatabaseBackup` | Deletes backup - ANY USER CAN DELETE | TODO |

**Status:** 🚨 CRITICAL - This allows unauthorized database backups/restores!

**Recommendation:**
- ALL endpoints - SYSTEM/ADMIN only

---

### 6. WhatsApp Endpoints (HIGH RISK - TODO)
**File:** `src/whatsapp/whatsapp.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `listWhatsAppTemplates` | Lists templates - ANY USER CAN ACCESS | TODO |
| `sendWhatsAppTemplateMessage` | Sends messages - ANY USER CAN SEND | TODO |
| `sendWhatsAppTextMessage` | Sends messages - ANY USER CAN SEND | TODO |

**Recommendation:**
- Require authentication
- ADMIN/SYSTEM for template management
- BUSINESS for sending (with limits)

---

### 7. AWS S3 Endpoints (MEDIUM RISK - TODO)
**File:** `src/services/aws-s3.resolver.ts`

| Endpoint | Issue | Status |
|----------|-------|--------|
| `generateS3PresignedUrl` | Generates upload URLs - UNPROTECTED | TODO |
| `deleteFileFromS3` | Deletes files - UNPROTECTED | TODO |
| `isS3Url` | Checks S3 URLs - ANY USER | OK (read-only) |

**Recommendation:**
- Require authentication for file operations
- Add authorization checks for ownership

---

## Prioritized Fix List

### 🔴 CRITICAL (Fix immediately)
1. ✓ Candidate Profile endpoints - **FIXED**
2. Database Backup endpoints
3. User management endpoints (already fixed)

### 🟠 HIGH (Fix soon)
1. Company endpoints
2. Interview endpoints
3. Communication endpoints
4. WhatsApp endpoints

### 🟡 MEDIUM (Fix in next iteration)
1. AWS S3 endpoints
2. AI Auto-complete endpoints (check if protected)
3. Application endpoints (review @Public decorator)

---

## Testing Required

### For Each Endpoint Fix:
1. Test with CANDIDATE token - should be blocked
2. Test with BUSINESS token - should be blocked (or limited)
3. Test with ADMIN token - should work
4. Test with SYSTEM token - should work
5. Test unauthenticated - should be blocked
6. Test with invalid token - should be blocked

---

## Implementation Plan

### Phase 1: Critical Endpoints
1. ✓ User endpoints
2. ✓ Candidate profile endpoints
3. Database backup endpoints

### Phase 2: High Risk
1. Company endpoints
2. Interview endpoints
3. Communication endpoints

### Phase 3: Medium Risk
1. AWS S3 endpoints
2. AI endpoints
3. WhatsApp endpoints

### Phase 4: Review & Audit
1. All other endpoints
2. Complete security audit
3. Documentation

---

## Code Pattern to Follow

For all protected endpoints, use this pattern:

```typescript
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '../user/user.entity';

// For ADMIN/SYSTEM only:
@Query(() => [Something])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN, UserType.SYSTEM)
async someQuery(): Promise<Something[]> {
  // Implementation
}

// For authenticated users with ownership check:
@Query(() => Something, { nullable: true })
@UseGuards(JwtAuthGuard)
async getOwnThing(
  @Args('id') id: string,
  @Context() context: any
): Promise<Something | null> {
  const userId = context.request?.user?.id;
  const thing = await this.service.findOne(id);
  
  // Check ownership
  if (thing.userId !== userId && context.request?.user?.userType !== UserType.ADMIN) {
    throw new ForbiddenException('Not authorized');
  }
  
  return thing;
}
```

---

## Modules to Update

1. `src/candidate/candidate.module.ts` - Update to ensure RolesGuard is available
2. `src/company/company.module.ts` - Add RolesGuard
3. `src/interview/interview.module.ts` - Add RolesGuard
4. `src/communication/communication.module.ts` - Add RolesGuard
5. `src/database-backup/database-backup.module.ts` - Add RolesGuard
6. `src/whatsapp/whatsapp.module.ts` - Add RolesGuard
7. `src/services/aws-s3.module.ts` - Add RolesGuard

---

## Completed Fixes

### ✓ User Endpoints (src/user/user.resolver.ts)
- [x] `users` query - ADMIN/SYSTEM only
- [x] `user(id)` query - ADMIN/SYSTEM only
- [x] `createUser` mutation - ADMIN/SYSTEM only
- [x] `updateUser` mutation - ADMIN/SYSTEM only
- [x] `me` query - Any authenticated user
- [x] `changePassword` mutation - Any authenticated user

### ✓ Candidate Profile Endpoints (src/candidate/candidate-profile.resolver.ts)
- [x] `candidateProfiles` query - ADMIN/SYSTEM only
- [x] `candidateProfile(id)` query - ADMIN/SYSTEM only
- [x] `candidateProfileByUser(userId)` query - Own profile or ADMIN/SYSTEM
- [x] `createCandidateProfile` mutation - ADMIN/SYSTEM only

---

## Next Steps

1. Rebuild and test candidate profile fixes
2. Create fixes for company endpoints
3. Create fixes for interview endpoints
4. Create fixes for communication endpoints
5. Create fixes for database backup endpoints (CRITICAL)
6. Full security audit of remaining endpoints
7. Update comprehensive test suite with all endpoints
