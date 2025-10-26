# Quick Start Guide - Testing the RoleVate App

## 🚀 Running the App

### On Android Device
```bash
cd /Users/husain/Desktop/rolevate/rolevateapp
flutter run -d c0c6d3f9
```

### On iOS Device
```bash
flutter run -d "Al-hussein's iPhone"
```

### On macOS
```bash
flutter run -d macos
```

### On Web (requires backend CORS setup)
```bash
flutter run -d chrome
```

## 🧪 Testing Scenarios

### 1. Test User Registration

**For Business Users:**
1. Open the app
2. Click "Sign Up"
3. Enter details:
   - Name: "Test Company"
   - Email: "test@company.com"
   - Password: "TestPass123!"
   - Select: "Business" user type
4. Click "Register"
5. Should auto-login and redirect to Business Dashboard

**For Candidates:**
1. Open the app
2. Click "Sign Up"
3. Enter details:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "TestPass123!"
   - Select: "Candidate" user type
4. Click "Register"
5. Should auto-login and redirect to Candidate Dashboard

### 2. Test User Login

1. Click "Login"
2. Enter credentials from registration
3. Click "Sign In"
4. Should redirect to appropriate dashboard based on user type

### 3. Test Job Browsing

**As a Guest or Candidate:**
1. Navigate to home screen
2. Browse available jobs
3. Click on a job to view details
4. Try filters (job type, location, etc.)
5. Test "Save Job" functionality (requires login)

### 4. Test Job Application

**As a Candidate:**
1. Login as a candidate
2. Browse jobs
3. Click on a job
4. Click "Apply"
5. Fill in application details:
   - Cover letter
   - Expected salary
   - Notice period
6. Submit application
7. Check "My Applications" to see submitted applications

### 5. Test Job Posting

**As a Business User:**
1. Login as a business user
2. Navigate to "Post Job"
3. Fill in job details:
   - Job title
   - Description
   - Requirements
   - Salary
   - Location
4. Submit job posting
5. View in "My Jobs" section

### 6. Test Application Management

**As a Business User:**
1. Navigate to "Applications"
2. View applications for your jobs
3. Filter by job
4. View application details
5. Update application status

## 🔍 What to Look For

### ✅ Success Indicators
- App launches without crashes
- Login/signup succeeds with valid credentials
- Jobs list loads and displays
- Job details open correctly
- Navigation between screens works smoothly
- Data persists after app restart
- Authenticated requests include Bearer token
- Protected endpoints require authentication

### ❌ Issues to Report
- App crashes or freezes
- Login fails with correct credentials
- Jobs don't load
- Blank screens
- Navigation errors
- Data not saving
- Authentication not persisting

## 📊 Expected API Behavior

### Public Endpoints (No Auth Required)
- ✅ `query GetJobs` - Should work without login
- ✅ `query GetJob(id)` - Should work without login
- ✅ `query GetJobBySlug(slug)` - Should work without login

### Protected Endpoints (Auth Required)
- 🔒 `query GetApplications` - Returns 403 if not logged in
- 🔒 `query GetSavedJobs` - Returns 403 if not logged in
- 🔒 `mutation CreateApplication` - Returns 403 if not logged in
- 🔒 `mutation SaveJob` - Returns 403 if not logged in

### Authentication Endpoints
- 🔓 `mutation Login` - Should work for registered users
- 🔓 `mutation CreateUser` - Should create new account

## 🐛 Debugging

### View Logs
When running with Flutter CLI, logs will appear in the terminal:
- ✅ Success messages start with checkmarks
- ❌ Error messages start with X marks
- 🔐 Authentication events are logged
- 📡 GraphQL requests/responses are logged

### Common Issues

**"Failed to fetch" on Web:**
- Backend CORS not configured
- See `CORS_SETUP.md` for solution
- Use native platforms (Android/iOS/Desktop) instead

**"Forbidden resource" errors:**
- Expected for protected endpoints when not logged in
- Login first, then try again

**App won't start:**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

## 📱 Test Accounts

Create test accounts with these roles:

**Business Account:**
- Email: test-business@rolevate.com
- Password: Business123!

**Candidate Account:**
- Email: test-candidate@rolevate.com
- Password: Candidate123!

## 🔄 Hot Reload

While app is running:
- Press `r` in terminal for hot reload
- Press `R` in terminal for hot restart
- Press `q` to quit

## 📝 Reporting Issues

When reporting issues, include:
1. Platform (Android/iOS/Web/Desktop)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Console logs/error messages
6. Screenshots if applicable

---

**Happy Testing! 🎉**
