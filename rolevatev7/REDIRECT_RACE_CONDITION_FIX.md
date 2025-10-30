# Redirect Race Condition Fix

## 🐛 The Bug

When submitting an application and creating a new account:

1. ✅ Token received and stored
2. ✅ Redirect to `/userdashboard` initiated  
3. ❌ **Redirects to `/login` instead**
4. ✅ After refresh, user data appears

### Why This Happened

**Race Condition Timeline:**

```
Time  Event                                              State
────  ─────────────────────────────────────────────────  ──────────────────
T+0   Application submitted                             authLoading=true
T+50  Token stored + event dispatched                   authLoading=true
T+100 Success screen shown, countdown starts (5s)       authLoading=true
T+150 ProtectedRoute component mounted                  authLoading=true
T+200 Countdown: 4s                                     authLoading=true
      AuthProvider receives token event, starts fetch    
T+300 Countdown: 3s                                     authLoading=true (still fetching)
T+400 Countdown: 2s                                     authLoading=true (still fetching)
T+500 Countdown: 1s                                     authLoading=true (still fetching)
T+600 Countdown: 0s                                     
      ❌ OLD: Redirect immediately (user still null!)
      ✅ NEW: Wait for authLoading=false
T+700 AuthProvider finishes fetch                       authLoading=false, user=loaded
T+750 ✅ NOW redirect to /userdashboard                 Dashboard renders correctly
```

## ✅ The Fix

**File:** `src/app/(website)/jobs/[slug]/apply/page.tsx`

**Changed the redirect logic to wait for user to load:**

```tsx
// OLD - Immediate redirect (race condition)
useEffect(() => {
  if (redirectCountdown === 0 && success) {
    router.push("/userdashboard");
  }
}, [redirectCountdown, success, router]);

// NEW - Wait for auth loading to complete
useEffect(() => {
  if (redirectCountdown === 0 && success && !authLoading) {
    console.log('[Apply] Countdown complete and user loaded, redirecting to dashboard');
    console.log('[Apply] User loaded:', !!user);
    router.push("/userdashboard");
  }
}, [redirectCountdown, success, router, authLoading, user]);
```

### Key Changes

1. **Added condition:** `!authLoading` - Only redirect when user is fully loaded
2. **Added debug logging** - Track when redirect happens and user status
3. **Added dependencies:** `authLoading` and `user` - Ensure effect runs when these change

## 🔍 How It Works Now

### Sequence of Events

1. **User submits application**
   - Token received
   - localStorage updated
   - Event dispatched: `auth-token-stored`

2. **Success screen displays**
   - Shows credentials
   - Countdown starts: 5s → 4s → 3s...
   - `authLoading = true` (AuthProvider is fetching)

3. **AuthProvider processes token event**
   - Receives custom event
   - Resets global state
   - Calls `loadUser()` to fetch with token
   - Sets `authLoading = true` initially
   - Fetches user data: ~300-500ms

4. **Countdown completes BUT waits**
   - At `redirectCountdown === 0`:
   - Checks: Is `authLoading === false`?
   - **If NO:** Wait (don't redirect)
   - **If YES:** Redirect to `/userdashboard`

5. **User data loaded**
   - AuthProvider finishes fetch
   - Sets `authLoading = false`
   - Sets `user = userData`

6. **Redirect executes**
   - Countdown at 0 + authLoading is false
   - Redirect to `/userdashboard`
   - ProtectedRoute validates user ✅
   - Dashboard renders with user data ✅

## 📊 Comparison

| Step | Before | After |
|------|--------|-------|
| **Submit app** | ✅ | ✅ |
| **Receive token** | ✅ | ✅ |
| **Store token** | ✅ | ✅ |
| **Dispatch event** | ✅ | ✅ |
| **Show countdown** | ✅ | ✅ |
| **AuthProvider fetches** | ⏱️ (happening...) | ⏱️ (happening...) |
| **Countdown hits 0** | ❌ Redirect immediately (user=null) | ⏱️ Still waiting |
| **User loaded** | ❌ Too late! | ✅ AuthProvider done |
| **Redirect executes** | ❌ To `/login` | ✅ To `/userdashboard` |
| **Dashboard renders** | ❌ 404 or login page | ✅ With user data |

## 🧪 Testing

### Test Case: New Account Application

```
1. Go to job page
2. Click "Apply Now"
3. Fill form as guest (no account)
4. Upload resume
5. Click "Submit Application"

Expected Results:
✅ Success screen with credentials shown
✅ Countdown: 5, 4, 3, 2, 1, 0...
✅ Console shows:
   - "✅ Token stored: eyJ..."
   - "[AuthProvider] Token stored event received - resetting auth state"
   - "[AuthProvider] Starting new fetch..."
   - "[AuthProvider] User loaded successfully: email@example.com"
   - "[Apply] Countdown complete and user loaded, redirecting to dashboard"
✅ Redirect to /userdashboard (NOT /login)
✅ Dashboard loads with user data immediately
❌ No need for manual refresh
```

### Browser Console Output

```javascript
✅ New account created and logged in automatically
✅ Token stored: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9A...
[AuthProvider] Token stored event received - resetting auth state
[AuthProvider] Resetting global auth state for token refetch
[AuthProvider] Starting new fetch...
[AuthProvider] User loaded successfully: info@roxate.com
[AuthProvider] User company: null
[Apply] Countdown complete and user loaded, redirecting to dashboard
[Apply] User loaded: true
```

## 🔐 Related Components

### AuthProvider Flow
- Listens for `auth-token-stored` event
- Resets global fetch state
- Calls `loadUser()` with token
- Sets `authLoading = false` when done

### ProtectedRoute Flow
- Checks `isLoading` (from AuthProvider)
- Waits for user to load
- Only allows access if user type matches
- Redirects to appropriate dashboard

### Application Form Flow
- Stores token in localStorage
- Dispatches `auth-token-stored` event
- Shows countdown for redirect
- NOW: Waits for `authLoading` before redirecting

## 📝 Files Modified

- `src/app/(website)/jobs/[slug]/apply/page.tsx` (lines 62-69)
  - Added `!authLoading` condition to redirect
  - Added debug logging
  - Added dependencies to effect hook

## ✨ Benefits

✅ **Seamless UX** - No unexpected redirects to login  
✅ **Reliable** - Handles network delays in user fetch  
✅ **Debuggable** - Console logs show timing of each step  
✅ **Maintainable** - Clear logic with comments  
✅ **No manual refresh** - Fully automated flow  
✅ **Works on slow networks** - Waits for fetch to complete  

## 🚀 Deployment Notes

- No breaking changes
- Backward compatible
- Improves user experience
- Includes detailed logging for debugging
- Ready for production

## 🔧 Future Improvements

- Add timeout if user fetch takes too long
- Add error recovery if fetch fails
- Show loading spinner during wait
- Add retry logic for network failures
- Monitor redirect success rate
