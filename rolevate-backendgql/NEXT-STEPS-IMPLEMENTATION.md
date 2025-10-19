# Next Steps - Anonymous Application Implementation

## Current Situation

### ✅ What's Working
1. S3 CV file storage and access
2. FastAPI CV analysis with OpenAI extraction
3. Code for updating candidate profiles (ApiKeyService enhanced)
4. CandidateProfile creation if missing

### ❌ What's Blocked
**CRITICAL BLOCKER:** FastAPI still getting "Forbidden resource" errors when calling NestJS GraphQL

**Reason:** NestJS server needs hard restart to load ApiKeyService changes

## Immediate Action Required

### Step 1: Restart NestJS Server
```bash
# Kill current server
pkill -f "nest start"

# Start fresh
cd /Users/husain/Desktop/rolevate/rolevate-backendgql
npm run start:dev
```

### Step 2: Verify Authentication Fix
```bash
# Test from command line
npx tsx test-real-application.ts

# Should see:
# ✅ SUCCESS! Application updated successfully
# ✅ Updated candidate profile with extracted data
```

### Step 3: Test FastAPI Integration
Submit a real anonymous application and watch FastAPI logs for:
```
✅ Extracted candidate info via OpenAI
📤 Posting CV analysis results to NestJS GraphQL...
✅ Successfully updated application (NO MORE "Forbidden resource")
```

## Implementation Plan

### Phase 1: Complete Current Flow (1-2 hours)
**Goal:** Get FastAPI → NestJS callback working end-to-end

**Tasks:**
- [x] Fix ApiKeyService to accept SYSTEM_API_KEY
- [x] Fix CandidateProfile creation if missing
- [ ] Restart server and verify
- [ ] Test with real FastAPI call
- [ ] Verify candidate profile updated correctly

### Phase 2: Add Login Credentials (2-3 hours)
**Goal:** Generate and send login credentials to candidate

**Tasks:**
- [ ] Add password generation after profile update
- [ ] Hash and store password in User entity
- [ ] Create SMS message template
- [ ] Send SMS with credentials using existing SMSService
- [ ] Test SMS delivery

**Code Location:**
```typescript
// src/application/application.service.ts - updateApplicationAnalysis()
// After updating candidate profile:

if (candidateInfo.phone && candidateInfo.email) {
  // Generate password
  const tempPassword = this.generateSecurePassword();
  
  // Hash and save
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  await this.userRepository.update(application.candidate.id, {
    password: hashedPassword
  });
  
  // Send SMS
  await this.smsService.sendLoginCredentials({
    phone: candidateInfo.phone,
    email: candidateInfo.email,
    password: tempPassword,
    loginUrl: 'https://app.rolevate.com/login'
  });
}
```

### Phase 3: Add LiveKit Room (1-2 hours)
**Goal:** Create interview room automatically

**Tasks:**
- [ ] Add LiveKit room creation after CV analysis
- [ ] Store room name and token in Application
- [ ] Add room link to SMS message
- [ ] Test room creation

**Code Location:**
```typescript
// src/application/application.service.ts - updateApplicationAnalysis()
// After credentials:

const room = await this.livekitService.createRoom({
  name: `interview-${application.id}`,
  metadata: JSON.stringify({
    applicationId: application.id,
    candidateId: application.candidate.id,
    jobId: application.job.id,
    jobTitle: application.job.title,
    companyId: application.job.companyId
  })
});

// Store room info
await this.applicationRepository.update(application.id, {
  livekitRoomName: room.name
});
```

### Phase 4: Company Notifications (1 hour)
**Goal:** Notify company when application received

**Tasks:**
- [ ] Send notification to company admins
- [ ] Include CV analysis score
- [ ] Include link to view application
- [ ] Test notifications

## Services Already Available

### SMSService (`src/services/sms.service.ts`)
```typescript
class SMSService {
  // Already has methods for sending SMS
  // Just need to add login credentials template
}
```

### JOSMSService (`src/services/josms.service.ts`)
```typescript
class JOSMSService {
  // Alternative SMS provider
  // Can use as fallback
}
```

### LiveKitService (`src/livekit/livekit.service.ts`)
```typescript
class LiveKitService {
  // Already has room creation methods
  // Already stores metadata
  // Just need to integrate into flow
}
```

## Decision Points

### 1. Password Strategy
**Options:**
- **A) Direct Password:** Generate random password, send via SMS ✅ RECOMMENDED
- **B) Magic Link:** Send one-time login link (expires in 24h)
- **C) Reset Token:** Send password reset link

**Recommendation:** Option A - Simple, works offline, user can save password

### 2. SMS Message Format
```
Hi [Name]! Your application to [Company] for [Job Title] has been received.

Your account:
Email: john@example.com
Password: Abc123XYZ!

Login: https://app.rolevate.com/login

Interview Link: https://app.rolevate.com/interview/abc-123

Good luck!
```

### 3. Interview Room Timing
**Options:**
- **A) Create immediately** when application submitted ✅ RECOMMENDED
- **B) Create when** company schedules interview

**Recommendation:** Option A - Room ready when needed, simpler flow

## Testing Checklist

### Authentication Test
- [ ] NestJS server restarted
- [ ] SYSTEM_API_KEY loaded from .env
- [ ] ApiKeyService.validateApiKey() checks environment first
- [ ] Test script passes: `npx tsx test-real-application.ts`
- [ ] FastAPI callback succeeds (no "Forbidden resource")

### End-to-End Test
- [ ] Submit anonymous application with CV
- [ ] FastAPI downloads CV successfully
- [ ] FastAPI extracts candidate info with OpenAI
- [ ] FastAPI posts back to NestJS (no errors)
- [ ] Candidate User email updated from placeholder
- [ ] CandidateProfile created/updated with CV data
- [ ] CV analysis score saved
- [ ] Password generated and hashed
- [ ] SMS sent with credentials
- [ ] LiveKit room created
- [ ] Company notification sent
- [ ] Candidate can login with credentials
- [ ] Candidate can access interview room

## Files to Check/Modify

### Already Modified
- ✅ `src/user/api-key.service.ts` - System API key validation
- ✅ `src/application/application.service.ts` - Profile creation/update
- ✅ `FASTAPI-GRAPHQL-INTEGRATION.md` - Integration guide

### Need to Modify
- [ ] `src/application/application.service.ts` - Add credentials + room creation
- [ ] `src/services/sms.service.ts` - Add login credentials template
- [ ] `src/livekit/livekit.service.ts` - May need room creation helper
- [ ] `src/notification/notification.service.ts` - Company notifications

## Success Criteria

**Phase 1 Complete When:**
- FastAPI successfully posts CV analysis back to NestJS ✅
- Candidate profile populated with real data ✅
- No authentication errors ✅

**Phase 2 Complete When:**
- Candidate receives SMS with login credentials
- Candidate can login successfully
- Password is secure and hashed

**Phase 3 Complete When:**
- LiveKit room created automatically
- Room metadata stored correctly
- Room link included in SMS

**Phase 4 Complete When:**
- Company receives notification of new application
- Notification includes CV score and candidate info
- Notification link opens application details

## Timeline Estimate

- **Phase 1:** 30 minutes (just restart + verify)
- **Phase 2:** 2-3 hours (credentials + SMS)
- **Phase 3:** 1-2 hours (LiveKit room)
- **Phase 4:** 1 hour (notifications)

**Total:** ~5-7 hours of development + testing

## Current Priority

🚨 **IMMEDIATE:** Restart NestJS server to unblock FastAPI integration

Once unblocked, everything else can proceed smoothly.

---

## Date
October 18, 2025
