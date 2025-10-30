# Bug Report: Duplicate Email in Anonymous Application Submission

## Problem Description

When a user submits an application with an email that already exists in the system, the backend:
1. ✅ Detects the existing user (in `createCandidateFromCVWithTransaction` and `createCandidateWithoutCVWithTransaction`)
2. ❌ **Updates the password** to a new random password
3. ❌ Returns new credentials instead of asking user to login
4. ❌ Locks the existing user out of their account with their old password

## Current Buggy Code Location

**File**: `src/application/application.service.ts`
**Methods**:
- `createCandidateFromCVWithTransaction()` (line 299)
- `createCandidateWithoutCVWithTransaction()` (line 374)

### Buggy Code (Line 378-385 and similar in other method):
```typescript
// ❌ BUG: Overwrites existing user's password!
if (user) {
  console.log('ℹ️ User already exists with email:', candidateInfo.email);
  await manager.update(User, { id: user.id }, {
    name: candidateInfo.name,
    password: hashedPassword,  // ❌ OVERWRITES existing password!
    phone: candidateInfo.phone,
  });
}
```

## Impact

- **Severity**: 🔴 HIGH
- **User Experience**: Existing users cannot login because password changed without consent
- **Security**: Passwords changed without authentication
- **Data Integrity**: User credentials compromised

## Root Cause

The code treats duplicate emails as "user already exists, just update them" instead of treating it as an error condition for anonymous applications.

---

## Solution Options

### Option 1: ✅ REJECT DUPLICATE EMAILS (RECOMMENDED)

**When a duplicate email is submitted:**
- Check if email already exists in User table
- If yes, return error: **"A user with this email already exists. Please login instead."**
- User must login with existing credentials to apply

**Advantages**:
- ✅ Protects user account security
- ✅ Prevents password hijacking
- ✅ Clear user experience
- ✅ Prevents account conflicts
- ✅ Follows authentication best practices

**Disadvantages**:
- Users must remember existing account
- Extra step for returning applicants

**Implementation**: Add early check in `createAnonymousApplication()` before creating new user

---

### Option 2: ❌ ALLOW DUPLICATE BUT DON'T CHANGE PASSWORD

**When a duplicate email is submitted:**
- Allow application creation
- Reuse existing user
- **Don't** change password
- Send message: "You already have an account. Your application has been submitted."

**Advantages**:
- ✅ Seamless experience
- ✅ Existing password stays same

**Disadvantages**:
- ❌ Still problematic - which email/phone belongs to which application?
- ❌ User confusion about multiple applications
- ❌ Multiple applications from same email

---

### Option 3: ❌ UPDATE WITHOUT CHANGING PASSWORD

**When a duplicate email is submitted:**
- Update name/phone if provided
- **Don't change password**
- Create application as if it's a new application

**Advantages**:
- ✅ Preserves password security

**Disadvantages**:
- ❌ Still has duplicate email issue
- ❌ User confusion

---

## Recommended Implementation: Option 1

**Best Practice**: Early validation prevents many issues downstream

### Implementation Steps:

1. **Add early check** in `createAnonymousApplication()` BEFORE password generation
2. **Check if email exists** in User table
3. **If exists, throw BadRequestException** with helpful message
4. **Return error to frontend** with suggestion to login

### Code Change:

```typescript
async createAnonymousApplication(
  createApplicationInput: CreateApplicationInput
): Promise<ApplicationResponse> {
  // ... validation code ...

  // ✅ NEW: Check for duplicate email EARLY
  if (createApplicationInput.email) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createApplicationInput.email }
    });
    
    if (existingUser) {
      throw new BadRequestException(
        'A user with this email already exists. Please login to your account to apply for this job.'
      );
    }
  }

  // Continue with rest of application creation
  // Generate password, create user, etc.
}
```

### Response to Frontend:

```json
{
  "errors": [
    {
      "message": "A user with this email already exists. Please login to your account to apply for this job.",
      "extensions": {
        "code": "EMAIL_ALREADY_EXISTS"
      }
    }
  ]
}
```

### Frontend UX:

```
❌ Application Submission Failed

A user account already exists with this email address.

Please login instead:
[Login Button] or [Forgot Password]

After login, you can apply for this job directly.
```

---

## Alternative: Allow But Ask for Confirmation

If you want to be more lenient, you could:

1. Return a warning that user exists
2. Ask: "Did you mean to use existing account?"
3. Provide options:
   - "Yes, login to existing account"
   - "No, use different email"

But this is more complex and Option 1 is cleaner.

---

## Testing Checklist

After implementation, test:

- [ ] First application with new email → creates user + password ✅
- [ ] Second application with same email → rejected with message ✅
- [ ] User can login with original password ✅
- [ ] User password not changed ✅
- [ ] Error message is clear ✅
- [ ] Frontend handles error gracefully ✅

---

## Related Code Sections to Review

1. `createCandidateFromCVWithTransaction()` (line 299)
2. `createCandidateWithoutCVWithTransaction()` (line 374)
3. `ApplicationResponse` DTO (needs error handling)
4. GraphQL resolver `createApplication` mutation

