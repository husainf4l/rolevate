# SMS Service Documentation

## Overview

The SMS service provides integration with JOSMS gateway for sending SMS messages in your application. It supports:

- ✅ **Single SMS** (OTP and General messages)
- ✅ **Bulk SMS** (up to 120 recipients)
- ✅ **Balance checking**
- ✅ **Cost estimation**
- ✅ **Automatic database logging**
- ✅ **Phone number validation**
- ✅ **Message length validation**

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# JOSMS Configuration
JOSMS_ACC_NAME=margogroup
JOSMS_ACC_PASS=nR@9g@Z7yV0@sS9bX1y
JOSMS_SENDER_ID=MargoGroup
```

### Account Details

**Platform:** [https://josms.net/sms/smsonline](https://josms.net/sms/smsonline)

**Username:** margogroup  
**Password:** wKridi7iT

**Sender ID:** MargoGroup

## Phone Number Format

JOSMS requires specific phone number format:

- **Format:** `962XXXXXXXXX` (12 digits)
- **Start with:** 962 (Jordan country code)
- **Operator codes:** 77, 78, or 79
- **No special characters:** No + or dots

### Examples

```
✅ Valid:
- 962775444418
- 962785551234
- 962795559999

❌ Invalid:
- +962775444418  (has +)
- 00962775444418 (has 00)
- 0775444418     (missing 962)
- 962765551234   (invalid operator code 76)
```

### Automatic Formatting

The service automatically formats phone numbers:

```typescript
// Input formats accepted:
"+962775444418"  →  "962775444418"
"00962775444418" →  "962775444418"
"0775444418"     →  "962775444418"
"775444418"      →  "962775444418"
```

## Message Length Limits

### Arabic Messages
- **Single SMS:** 70 characters
- **Multi-part:** 62 characters per part

### English Messages
- **Single SMS:** 160 characters
- **Multi-part:** 152 characters per part

### Maximum Parts
- **Limit:** 10 parts per message
- **Warning:** System warns if message requires multiple parts

## GraphQL API

### 1. Send Single SMS

```graphql
mutation SendSMS($input: SendSMSInput!) {
  sendSMS(input: $input) {
    success
    messageId
    response
    error
    statusCode
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "phoneNumber": "962775444418",
    "message": "Hello! This is a test SMS from Rolevate.",
    "type": "GENERAL",
    "candidateId": "candidate-123",
    "applicationId": "app-456"
  }
}
```

**Message Types:**
- `OTP` - For one-time passwords and verification codes
- `GENERAL` - For announcements, notifications, reminders
- `BULK` - Handled automatically for multiple recipients

### 2. Send OTP SMS

```graphql
mutation SendOTP($input: SendOTPSMSInput!) {
  sendOTPSMS(input: $input) {
    success
    messageId
    response
    error
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "phoneNumber": "962775444418",
    "otpCode": "123456",
    "messageTemplate": "Your verification code is: {code}. Valid for 10 minutes.",
    "candidateId": "candidate-123"
  }
}
```

**Default OTP Template:**
```
Your verification code is: {code}. Valid for 10 minutes. Do not share this code with anyone.
```

### 3. Send Bulk SMS

```graphql
mutation SendBulkSMS($input: SendBulkSMSInput!) {
  sendBulkSMS(input: $input) {
    success
    totalRecipients
    messageId
    response
    error
    costEstimation {
      parts
      totalMessages
      estimatedCost
      currency
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "phoneNumbers": [
      "962775444418",
      "962785551234",
      "962795559999"
    ],
    "message": "New job opportunity! Apply now at rolevate.com",
    "companyId": "company-123",
    "jobId": "job-456"
  }
}
```

**Limits:**
- Maximum 120 recipients per request
- For more recipients, split into multiple requests

### 4. Check SMS Balance

```graphql
query GetSMSBalance {
  getSMSBalance {
    success
    balance
    currency
    error
  }
}
```

**Response:**
```json
{
  "data": {
    "getSMSBalance": {
      "success": true,
      "balance": 1500.50,
      "currency": "JOD"
    }
  }
}
```

### 5. Estimate SMS Cost

```graphql
query EstimateSMSCost($message: String!, $recipientCount: Int!) {
  estimateSMSCost(message: $message, recipientCount: $recipientCount) {
    parts
    totalMessages
    estimatedCost
    currency
  }
}
```

**Variables:**
```json
{
  "message": "This is a test message to see how many parts it will be split into.",
  "recipientCount": 50
}
```

**Response:**
```json
{
  "data": {
    "estimateSMSCost": {
      "parts": 1,
      "totalMessages": 50,
      "estimatedCost": 1.50,
      "currency": "JOD"
    }
  }
}
```

## TypeScript Usage

### Basic SMS Sending

```typescript
import { SMSService } from './services/sms.service';

@Injectable()
export class MyService {
  constructor(private smsService: SMSService) {}

  async sendWelcomeSMS(phoneNumber: string, userName: string) {
    const result = await this.smsService.sendSMS({
      phoneNumber,
      message: `Welcome to Rolevate, ${userName}! Start your career journey today.`,
      type: SMSMessageType.GENERAL,
    });

    if (result.success) {
      console.log('SMS sent successfully:', result.messageId);
    } else {
      console.error('SMS failed:', result.error);
    }

    return result;
  }
}
```

### Send OTP

```typescript
async sendVerificationCode(phoneNumber: string, code: string) {
  return await this.smsService.sendOTP({
    phoneNumber,
    otpCode: code,
    // Uses default template or provide custom:
    messageTemplate: 'Your Rolevate verification code: {code}. Expires in 5 minutes.'
  });
}
```

### Bulk SMS

```typescript
async notifyJobSeekers(phoneNumbers: string[], jobTitle: string, companyName: string) {
  return await this.smsService.sendBulkSMS({
    phoneNumbers,
    message: `New ${jobTitle} position at ${companyName}. Apply now!`,
    companyId: 'company-123',
    jobId: 'job-456'
  });
}
```

### Application Status Update

```typescript
async notifyApplicationStatus(application: Application) {
  return await this.smsService.sendApplicationStatusSMS(
    application.candidate.phone,
    application.candidate.name,
    application.job.title,
    application.status,
    application.candidateId,
    application.id
  );
}
```

### Interview Reminder

```typescript
async sendInterviewReminder(interview: Interview) {
  return await this.smsService.sendInterviewReminderSMS(
    interview.candidate.phone,
    interview.candidate.name,
    interview.job.title,
    interview.scheduledAt,
    interview.candidateId,
    interview.applicationId
  );
}
```

## Pre-built SMS Templates

The service includes pre-built templates for common scenarios:

### Application Status Messages

```typescript
// Automatically handles these statuses:
- REVIEWED: "Hi {name}, your application for {job} is under review..."
- SHORTLISTED: "Congratulations {name}! You've been shortlisted..."
- INTERVIEWED: "Hi {name}, your interview for {job} has been scheduled..."
- OFFERED: "Congratulations {name}! You've received a job offer..."
- HIRED: "Welcome aboard {name}! You've been hired..."
- REJECTED: "Hi {name}, thank you for your interest in {job}..."
```

### Usage:

```typescript
await smsService.sendApplicationStatusSMS(
  '962775444418',
  'John Doe',
  'Senior Developer',
  'SHORTLISTED',
  'candidate-123',
  'app-456'
);
```

## Database Logging

All SMS messages are automatically logged to the `communication` table:

```typescript
{
  type: 'SMS',
  direction: 'OUTBOUND',
  content: 'Message content',
  phoneNumber: '962775444418',
  status: 'SENT' | 'FAILED',
  sentAt: Date,
  candidateId: '...',
  companyId: '...',
  jobId: '...',
  applicationId: '...'
}
```

## Cost Calculation

### Automatic Cost Estimation

```typescript
const estimation = await smsService.estimateCost(
  'Your message here',
  100 // recipient count
);

console.log(`Parts: ${estimation.parts}`);
console.log(`Total Messages: ${estimation.totalMessages}`);
console.log(`Estimated Cost: ${estimation.estimatedCost} ${estimation.currency}`);
```

### Example Costs (Approximate)

- **Single SMS:** 0.03 JOD per message
- **Multi-part:** 0.03 JOD × parts × recipients
- **Bulk (100 recipients):** 3.00 JOD (1-part message)

## Error Handling

### Common Errors

1. **Invalid Phone Number**
```json
{
  "success": false,
  "error": "Invalid phone number format: +1234567890. Expected format: 962XXXXXXXXX"
}
```

2. **Invalid Operator Code**
```json
{
  "success": false,
  "error": "Invalid operator code: 76. Must be 77, 78, or 79"
}
```

3. **Message Too Long**
```json
{
  "success": false,
  "error": "Message too long: 1500 chars, 12 parts. Maximum 10 parts allowed."
}
```

4. **Too Many Recipients**
```json
{
  "success": false,
  "error": "Too many recipients: 150. Maximum 120 allowed per bulk request."
}
```

5. **Missing Phone Number**
```json
{
  "success": false,
  "error": "Phone number is required for SMS messages"
}
```

### Handling Failures

```typescript
const result = await smsService.sendSMS(input);

if (!result.success) {
  // Log the error
  logger.error(`SMS failed: ${result.error}`);
  
  // Notify admin
  await notifyAdmin(`SMS delivery failed: ${result.error}`);
  
  // Try alternative communication method
  await sendEmailFallback(input);
}
```

## Best Practices

### 1. Validate Before Sending

```typescript
// Check balance first for bulk operations
const balance = await smsService.getBalance();
if (balance.balance < 10) {
  throw new Error('Insufficient SMS balance');
}

// Estimate cost
const cost = await smsService.estimateCost(message, recipientCount);
if (cost.estimatedCost > budget) {
  throw new Error('SMS cost exceeds budget');
}
```

### 2. Use Appropriate Message Type

```typescript
// OTP messages
await smsService.sendOTP({
  phoneNumber: '...',
  otpCode: '123456'
});

// General notifications
await smsService.sendSMS({
  phoneNumber: '...',
  message: '...',
  type: SMSMessageType.GENERAL
});
```

### 3. Handle Rate Limiting

```typescript
// For bulk operations, add delays
for (const batch of batches) {
  await smsService.sendBulkSMS(batch);
  await sleep(1000); // 1 second delay between batches
}
```

### 4. Monitor Deliverability

```typescript
// Log all SMS sends
const result = await smsService.sendSMS(input);

await monitoringService.log({
  type: 'SMS',
  success: result.success,
  recipient: input.phoneNumber,
  messageId: result.messageId,
  error: result.error
});
```

### 5. Use Templates for Consistency

```typescript
// Define templates
const TEMPLATES = {
  WELCOME: 'Welcome to {company}, {name}! Get started at {url}',
  OTP: 'Your {company} code: {code}. Expires in {minutes} min.',
  REMINDER: '{name}, reminder: {event} at {time}',
};

// Use template
const message = TEMPLATES.WELCOME
  .replace('{company}', 'Rolevate')
  .replace('{name}', userName)
  .replace('{url}', 'rolevate.com');
```

## Testing

### Manual Testing

```graphql
# Test single SMS
mutation {
  sendSMS(input: {
    phoneNumber: "962775444418"
    message: "Test SMS from Rolevate"
    type: GENERAL
  }) {
    success
    messageId
    error
  }
}

# Check balance
query {
  getSMSBalance {
    success
    balance
    currency
  }
}
```

### Unit Testing

```typescript
describe('SMS Service', () => {
  it('should format phone numbers correctly', () => {
    const formatted = josmsService.formatPhoneNumber('+962775444418');
    expect(formatted).toBe('962775444418');
  });

  it('should validate message length', () => {
    const validation = josmsService.validateMessageLength('Short msg');
    expect(validation.valid).toBe(true);
    expect(validation.parts).toBe(1);
  });

  it('should calculate cost correctly', () => {
    const cost = josmsService.calculateCost('Test message', 10);
    expect(cost.totalMessages).toBe(10);
    expect(cost.estimatedCost).toBeGreaterThan(0);
  });
});
```

## Monitoring

### Key Metrics to Track

1. **Send Rate:** SMS sent per hour/day
2. **Success Rate:** Successful deliveries / Total attempts
3. **Balance:** Remaining SMS credits
4. **Cost:** Total spend per day/month
5. **Error Rate:** Failed sends / Total attempts

### Logging

```typescript
// All SMS operations are logged
logger.log('SMS sent successfully', {
  messageId: result.messageId,
  recipient: phoneNumber,
  type: messageType,
  parts: validation.parts,
});

logger.error('SMS failed', {
  recipient: phoneNumber,
  error: result.error,
  type: messageType,
});
```

## Security Considerations

1. **Credentials:** Store JOSMS credentials in environment variables
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Phone Validation:** Always validate phone numbers before sending
4. **Audit Trail:** All SMS are logged to database with timestamps
5. **Access Control:** Use guards to restrict SMS sending permissions

## Troubleshooting

### SMS Not Sending

1. Check JOSMS balance: `getSMSBalance`
2. Verify phone number format
3. Check error logs in database
4. Verify JOSMS credentials in environment variables
5. Test connectivity to josms.net

### Invalid Phone Numbers

- Ensure format is 962XXXXXXXXX
- Check operator code (77, 78, or 79)
- Remove special characters
- Use the automatic formatter

### Message Not Delivered

- Verify phone number is active
- Check message length limits
- Verify sender ID is approved
- Check JOSMS account status

## Support

For JOSMS platform issues:
- **Website:** [https://josms.net](https://josms.net)
- **Login:** [https://josms.net/sms/smsonline](https://josms.net/sms/smsonline)
- **Account:** margogroup

For technical support with the integration, check the code in:
- `src/services/josms.service.ts` - Low-level JOSMS API
- `src/services/sms.service.ts` - High-level SMS service
- `src/services/sms.resolver.ts` - GraphQL API
- `src/communication/communication.service.ts` - Communication integration

---

**Ready to send SMS!** 🚀📱
