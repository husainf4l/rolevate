# Quick Reference: New Features API

## 🔖 Saved Jobs

### Save a Job
```graphql
mutation {
  saveJob(jobId: "abc-123", notes: "Love this company!") {
    id
    savedAt
    job { title company { name } }
  }
}
```

### Unsave a Job
```graphql
mutation {
  unsaveJob(jobId: "abc-123")
}
```

### Check if Saved
```graphql
query {
  isJobSaved(jobId: "abc-123")
}
```

### Get All Saved Jobs
```graphql
query {
  savedJobs {
    id
    savedAt
    notes
    job {
      id
      title
      company { name logo }
      salary
      location
    }
  }
}
```

---

## 🔒 Password Change

```graphql
mutation {
  changePassword(input: {
    currentPassword: "OldPass123!"
    newPassword: "NewSecurePass456!"
  })
}
```

**Requirements:**
- Current password must be correct
- New password ≥ 8 characters
- Must have: uppercase + lowercase + number + special char
- Cannot be same as current password

---

## 🔔 Notification Settings

### Get Settings
```graphql
query {
  notificationSettings {
    emailNotifications
    smsNotifications
    pushNotifications
    emailApplicationUpdates
    emailInterviewReminders
    pushNewMessages
    marketingEmails
  }
}
```

### Update Settings
```graphql
mutation {
  updateNotificationSettings(input: {
    emailNotifications: false
    smsNotifications: true
    pushNewMessages: false
  }) {
    emailNotifications
    smsNotifications
    pushNotifications
    updatedAt
  }
}
```

---

## 🎯 All Endpoints at a Glance

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `saveJob` | Mutation | JWT | Bookmark a job |
| `unsaveJob` | Mutation | JWT | Remove bookmark |
| `isJobSaved` | Query | JWT | Check saved status |
| `savedJobs` | Query | JWT | Get all bookmarks |
| `changePassword` | Mutation | JWT | Update password |
| `notificationSettings` | Query | JWT | Get preferences |
| `updateNotificationSettings` | Mutation | JWT | Update preferences |

---

## ⚡ Quick Test Commands

```bash
# Test with curl (replace TOKEN and JOB_ID)
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"mutation { saveJob(jobId: \"JOB_ID\") { id savedAt } }"}'

# Test password change
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"mutation { changePassword(input: { currentPassword: \"Old123!\", newPassword: \"New456!\" }) }"}'
```

---

## 📝 Migration Commands

```bash
# Generate migration
npm run migration:generate -- -n AddSavedJobsAndNotificationSettings

# Run migration
npm run migration:run

# Revert if needed
npm run migration:revert
```

---

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 409 Conflict | Job already saved | Check `isJobSaved` first |
| 404 Not Found | Job or SavedJob doesn't exist | Verify IDs |
| 401 Unauthorized | Wrong current password | Check password |
| 400 Bad Request | Password validation failed | Follow requirements |

---

## 💡 Frontend Integration Tips

### React Hook for Saved Jobs
```typescript
const useSavedJob = (jobId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const saveJob = async (notes?: string) => {
    await apollo.mutate({
      mutation: SAVE_JOB,
      variables: { jobId, notes }
    });
    setIsSaved(true);
  };
  
  const unsaveJob = async () => {
    await apollo.mutate({
      mutation: UNSAVE_JOB,
      variables: { jobId }
    });
    setIsSaved(false);
  };
  
  return { isSaved, saveJob, unsaveJob };
};
```

### Password Strength Indicator
```typescript
const validatePassword = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  return { checks, strength };
};
```

---

## 🔍 Service Method Reference

### JobService
```typescript
saveJob(userId: string, jobId: string, notes?: string): Promise<SavedJobDto>
unsaveJob(userId: string, jobId: string): Promise<boolean>
isJobSaved(userId: string, jobId: string): Promise<boolean>
getSavedJobs(userId: string): Promise<SavedJobDto[]>
```

### UserService
```typescript
changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
```

### NotificationService
```typescript
getNotificationSettings(userId: string): Promise<NotificationSettingsDto>
updateNotificationSettings(userId: string, input: UpdateNotificationSettingsInput): Promise<NotificationSettingsDto>
createDefaultSettings(userId: string): Promise<NotificationSettings>
isNotificationEnabled(userId: string, type: 'email' | 'sms' | 'push'): Promise<boolean>
```

---

## 📊 Database Schema

### saved_job Table
```
id          UUID PRIMARY KEY
userId      UUID FOREIGN KEY → user(id) ON DELETE CASCADE
jobId       UUID FOREIGN KEY → job(id) ON DELETE CASCADE
savedAt     TIMESTAMP DEFAULT now()
notes       TEXT NULL
UNIQUE(userId, jobId)
```

### notification_settings Table
```
id                        UUID PRIMARY KEY
userId                    UUID UNIQUE FOREIGN KEY → user(id) ON DELETE CASCADE
emailNotifications        BOOLEAN DEFAULT true
emailApplicationUpdates   BOOLEAN DEFAULT true
emailInterviewReminders   BOOLEAN DEFAULT true
emailJobRecommendations   BOOLEAN DEFAULT true
emailNewsletter           BOOLEAN DEFAULT true
smsNotifications          BOOLEAN DEFAULT false
smsApplicationUpdates     BOOLEAN DEFAULT false
smsInterviewReminders     BOOLEAN DEFAULT false
pushNotifications         BOOLEAN DEFAULT true
pushApplicationUpdates    BOOLEAN DEFAULT true
pushInterviewReminders    BOOLEAN DEFAULT true
pushNewMessages           BOOLEAN DEFAULT true
marketingEmails           BOOLEAN DEFAULT false
partnerOffers             BOOLEAN DEFAULT false
createdAt                 TIMESTAMP DEFAULT now()
updatedAt                 TIMESTAMP DEFAULT now()
```

---

**Last Updated:** 2024
**Status:** Production Ready
