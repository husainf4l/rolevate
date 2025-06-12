# 🎯 Room URL Structure Update - Phone Number & Job ID Flow

## ✅ **Updated URL Structure**

### **New URL Format:**

```
http://localhost:3005/room?phoneNumber=76856789&jobId=8793273
```

### **Parameters:**

- `phoneNumber`: The candidate's phone number (e.g., `76856789`)
- `jobId`: The job posting ID (e.g., `8793273`)

## 🚀 **Backend Integration**

### **API Call Structure:**

The frontend now sends these parameters directly to the backend:

```typescript
// Frontend sends to backend
const response = await publicInterviewService.createAndJoinRoom({
  jobPostId: jobId, // From URL: ?jobId=8793273
  phoneNumber: phoneNumber, // From URL: ?phoneNumber=76856789
  firstName: candidateDetails.firstName,
  lastName: candidateDetails.lastName,
});
```

### **Backend Endpoint:**

```
POST /api/public/interview/room/create-and-join

Request Body:
{
  "jobPostId": "8793273",
  "phoneNumber": "76856789",
  "firstName": "Ahmed",
  "lastName": "Hassan"
}
```

## 📋 **Key Changes Made**

### **1. Updated Room Component (`page.tsx`)**

- ✅ Changed from `roomCode` to `phoneNumber` + `jobId` parameters
- ✅ Auto-populates phone number field from URL
- ✅ Updated demo mode to use new parameter structure
- ✅ Modified validation to check for both required parameters

### **2. Updated Service Layer**

- ✅ Modified `endInterview()` to use `jobId` instead of `roomCode`
- ✅ Updated API endpoint paths to use job-based routing

### **3. Enhanced User Experience**

- ✅ Phone number automatically filled from URL parameter
- ✅ User only needs to enter first name and last name
- ✅ Demo mode works with: `?phoneNumber=76856789&jobId=8793273`

## 🎯 **Flow Overview**

### **1. URL Access:**

```
User clicks: http://localhost:3005/room?phoneNumber=76856789&jobId=8793273
```

### **2. Form Pre-fill:**

```
✅ Phone Number: "76856789" (auto-filled)
❓ First Name: [user enters]
❓ Last Name: [user enters]
```

### **3. Backend Call:**

```typescript
POST /api/public/interview/room/create-and-join
{
  "jobPostId": "8793273",
  "phoneNumber": "76856789",
  "firstName": "Ahmed",
  "lastName": "Hassan"
}
```

### **4. Response:**

```json
{
  "token": "...",
  "serverUrl": "wss://...",
  "participantToken": "...",
  "roomName": "interview_8793273",
  "identity": "candidate_76856789_timestamp",
  "roomCode": "GENERATED",
  "participantName": "Ahmed Hassan",
  "jobTitle": "Senior Developer",
  "companyName": "MENA Bank",
  "instructions": "Welcome...",
  "maxDuration": 1800
}
```

## 🔧 **Demo Mode**

### **Demo URL:**

```
http://localhost:3005/room?phoneNumber=76856789&jobId=8793273
```

### **Demo Features:**

- ✅ Quick-fill button with sample data
- ✅ Mock backend response when API fails
- ✅ Full UI flow without real LiveKit connection

## 📱 **n8n Integration**

Your n8n workflow can now send WhatsApp messages with simple URLs:

```
Hi Ahmed! 👋

Your interview for Senior Developer at MENA Bank is ready.

Click here to join:
http://localhost:3005/room?phoneNumber=76856789&jobId=8793273

Good luck! 🚀
```

## 🎯 **Benefits**

1. **✅ Direct Parameter Passing:** Phone number and job ID sent directly to backend
2. **✅ Simplified URL:** Clean query parameter structure
3. **✅ Auto-fill UX:** Phone number pre-populated for user convenience
4. **✅ Flexible Job IDs:** Any job ID format supported
5. **✅ Demo Mode:** Full testing capability maintained

## 🚀 **Backend Requirements**

Your backend needs to implement:

```
POST /api/public/interview/room/create-and-join
- Accept: jobPostId, phoneNumber, firstName, lastName
- Return: Complete interview setup + LiveKit tokens

POST /api/public/interview/job/{jobId}/end
- Accept: sessionId, candidateId
- Return: Success confirmation
```

## 🎉 **Ready for Production!**

The frontend now supports the exact URL structure you requested:

- ✅ `?phoneNumber=76856789`
- ✅ `?jobId=8793273`
- ✅ Direct backend integration
- ✅ Clean user experience

Perfect for your n8n WhatsApp integration! 🚀
