# Authentication Token Storage and Auth State Sync Fix

## Problem Identified

When a candidate submitted an application without an account and received credentials with a new token:

1. **Token was stored** in localStorage correctly
2. **But page didn't update** until manual refresh
3. **Root cause**: AuthProvider's global state had already completed its fetch before the token was stored

### The Issue in Detail

```
Timeline of the bug:
├─ Page loads
│  └─ AuthProvider checks for token in localStorage
│     └─ No token found
│        └─ Sets globalFetchCompleted = true
├─ User submits application
│  └─ Receives token in credentials
│     └─ Token stored in localStorage ✅
│     └─ BUT AuthProvider doesn't refetch (globalFetchCompleted = true) ❌
└─ Manual page refresh
   └─ AuthProvider sees token in localStorage
      └─ Now fetches user data ✅
```

## Solution Implemented

### 1. **Event-Based Token Storage Notification**
When credentials are received and token is stored, dispatch a custom event:

**File: `src/app/(website)/jobs/[slug]/apply/page.tsx`**
```tsx
if (applicationResponse.candidateCredentials) {
  setCredentials(applicationResponse.candidateCredentials);
  localStorage.setItem('access_token', applicationResponse.candidateCredentials.token);
  
  // NEW: Dispatch event to notify AuthProvider
  window.dispatchEvent(new Event('auth-token-stored'));
}
```

### 2. **Global Auth State Reset Function**
Added function to reset the global fetch state:

**File: `src/components/common/AuthProvider.tsx`**
```tsx
// Function to reset global state (called when auth token is stored)
function resetGlobalAuthState() {
  console.log('[AuthProvider] Resetting global auth state for token refetch');
  globalFetchPromise = null;
  globalFetchCompleted = false;
}
```

### 3. **Event Listener in AuthProvider**
Listen for the token storage event and refetch user data:

**File: `src/components/common/AuthProvider.tsx`**
```tsx
useEffect(() => {
  isMounted.current = true;
  loadUser();

  // Listen for token storage events (from application form)
  const handleTokenStored = () => {
    console.log('[AuthProvider] Token stored event received - resetting auth state');
    resetGlobalAuthState();
    // Force reload user data after a short delay
    setTimeout(() => {
      if (isMounted.current) {
        loadUser();
      }
    }, 100);
  };

  window.addEventListener('auth-token-stored', handleTokenStored);

  return () => {
    isMounted.current = false;
    window.removeEventListener('auth-token-stored', handleTokenStored);
  };
}, [user]);
```

## How It Works Now

```
Timeline of the fix:
├─ Page loads
│  └─ AuthProvider checks for token in localStorage
│     └─ No token found
│        └─ Sets globalFetchCompleted = true
├─ User submits application
│  └─ Receives token in credentials
│     └─ Token stored in localStorage ✅
│     └─ Custom event 'auth-token-stored' dispatched ✅
│        └─ AuthProvider listener receives event
│           └─ Calls resetGlobalAuthState() ✅
│              └─ Sets globalFetchPromise = null
│              └─ Sets globalFetchCompleted = false
│           └─ Calls loadUser() after 100ms ✅
│              └─ Now fetches user data with token ✅
│                 └─ Page updates immediately ✅
│
└─ User redirected to /userdashboard
   └─ With valid user data already loaded ✅
```

## Debug Logging

Console will show:
```
✅ New account created and logged in automatically
✅ Token stored: eyJhbGciOiJIUzI1NiIs...
[AuthProvider] Token stored event received - resetting auth state
[AuthProvider] Resetting global auth state for token refetch
[AuthProvider] Starting new fetch...
[AuthProvider] User loaded successfully: user@example.com
```

## Changes Made

### `/src/app/(website)/jobs/[slug]/apply/page.tsx`
- Added event dispatch when token is stored
- Added debug logging for token storage
- Updated redirect from `/userdashboard/applications` to `/userdashboard`

### `/src/components/common/AuthProvider.tsx`
- Added `resetGlobalAuthState()` function
- Added event listener for `auth-token-stored` event
- Added 100ms delay before refetch to ensure token is properly stored
- Properly clean up event listener on unmount

## Testing Checklist

- [ ] Apply for job as guest (no account)
- [ ] Receive credentials with token
- [ ] Verify token is in localStorage
- [ ] Check console for auth event messages
- [ ] Verify user data loads without page refresh
- [ ] Confirm redirect to `/userdashboard` happens automatically
- [ ] Verify dashboard shows authenticated user data
- [ ] No "refresh required" message appears

## Benefits

✅ **Immediate authentication** after application submission  
✅ **Seamless UX** - no manual refresh needed  
✅ **Automatic redirect** with valid user context  
✅ **Proper state management** - global auth state properly synchronized  
✅ **Event-driven architecture** - clean separation of concerns  

## Future Improvements

- Add retry logic if user fetch fails
- Add timeout for token storage event
- Consider using localStorage events instead of custom events
- Add analytics for successful auto-login flow
