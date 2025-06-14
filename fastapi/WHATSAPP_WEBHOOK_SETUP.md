# WhatsApp Webhook Setup Guide

## Overview

This guide helps you set up WhatsApp Business API webhooks to receive messages and process them through your job post creation agent.

## 🛠️ Setup Steps

### 1. **Environment Configuration**

Your `.env` file should contain:
```properties
# WhatsApp Business API credentials
WHATSAPP_PHONE_NUMBER_ID=684085261451106
WHATSAPP_BUSINESS_ACCOUNT_ID=1068830495102485
WHATSAPP_API_TOKEN=EAAP7nJu99q8BOwUwdWKKZABgPY94e3ZBMpOO3U0lWAclL9ZAZA40KOriMwCw0jiGo7iV9IbCn5M7sQZAO13VIupkAYshWMNAmK7QfwSkZC37TXtMwZB7vVIoIQyjpds1pmImwZCdN17gSilVsW0UlCtsZBZAApUT4wSBWN0FQiiUEIzEW0tBKrlcQxjmWjbJhxUWJJjKS6nd76QZBRaSVGNA4YbziYLp4dwoyDsOPZBFsHqArHVdUQx1
WHATSAPP_API_VERSION=v18.0

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=rolevate_webhook_verify_token_2025
```

### 2. **Webhook Endpoints**

The following endpoints are now available:

#### **GET /webhook** - Webhook Verification
Used by WhatsApp to verify your webhook endpoint.

#### **POST /webhook** - Receive Messages
Processes incoming WhatsApp messages through the job post agent.

### 3. **Configure WhatsApp Business API**

#### **Option A: Facebook Developer Console**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Navigate to your WhatsApp Business app
3. Go to **WhatsApp > Configuration**
4. Set webhook URL: `https://your-domain.com/webhook`
5. Set verify token: `rolevate_webhook_verify_token_2025`
6. Subscribe to **messages** events

#### **Option B: Using ngrok (for testing)**
1. Install ngrok: `brew install ngrok`
2. Start your FastAPI server: `uvicorn main:app --reload`
3. In another terminal: `ngrok http 8000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Use this URL + `/webhook` in Facebook Developer Console

### 4. **Test the Setup**

#### **Manual Verification Test:**
```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.challenge=1234567890&hub.verify_token=rolevate_webhook_verify_token_2025"
```

Should return: `1234567890`

#### **Run Integration Tests:**
```bash
python test_whatsapp_webhook_integration.py
```

## 📱 How It Works

### **Message Flow:**
1. User sends WhatsApp message to your business number
2. WhatsApp sends webhook to your `/webhook` endpoint
3. Message is processed through `WhatsAppJobPostHandler`
4. Job post agent processes the message
5. Response is sent back to WhatsApp user

### **Session Management:**
- Each phone number gets a unique session ID: `whatsapp_{phone_number}`
- Sessions persist across multiple messages
- Complete job creation workflow supported

### **Supported Message Types:**
- ✅ Text messages
- ✅ Button replies
- ✅ Interactive list replies
- ❌ Media, documents, voice (will send instructions for text)

## 🔧 Webhook URLs

### **Development (localhost):**
- Verification: `http://localhost:8000/webhook`
- Webhook: `http://localhost:8000/webhook`

### **Production:**
- Verification: `https://your-domain.com/webhook`
- Webhook: `https://your-domain.com/webhook`

## 🧪 Testing

### **Test Commands:**

1. **Start your server:**
   ```bash
   uvicorn main:app --reload
   ```

2. **Test webhook verification:**
   ```bash
   python test_whatsapp_webhook_integration.py
   ```

3. **Test with ngrok (for real WhatsApp):**
   ```bash
   # Terminal 1
   uvicorn main:app --reload
   
   # Terminal 2
   ngrok http 8000
   
   # Use the ngrok HTTPS URL in Facebook Developer Console
   ```

## 📝 Example Conversation

**User:** "I want to create a job post for a developer"

**Bot:** "Perfect! I'm auto-completing this for you...

**Job Title:** Developer

**Location:** Remote

To get started, could you tell me:
- What specific type of developer?
- What's the experience level needed?

For example: 'Senior React Developer', 'Full-Stack .NET Developer', etc."

**User:** "Senior React Developer with 5+ years experience"

**Bot:** "Excellent! A senior React developer with 5+ years experience..."

*[Conversation continues until job post is complete]*

## 🚨 Troubleshooting

### **Common Issues:**

1. **Webhook verification fails:**
   - Check `WEBHOOK_VERIFY_TOKEN` in `.env`
   - Ensure server is running and accessible

2. **Messages not being received:**
   - Check WhatsApp webhook subscription
   - Verify webhook URL is correct and HTTPS

3. **500 errors in webhook:**
   - Check server logs: `uvicorn main:app --reload`
   - Verify all dependencies are installed

4. **Messages sent but no responses:**
   - Check WhatsApp API token validity
   - Verify phone number ID is correct

### **Debug Commands:**

```bash
# Check if server is running
curl http://localhost:8000/

# Test webhook verification
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=rolevate_webhook_verify_token_2025"

# View server logs
uvicorn main:app --reload --log-level debug
```

## 🔐 Security

- Always use HTTPS in production
- Keep webhook verify token secret
- Validate incoming webhook signatures (optional enhancement)
- Rate limit webhook endpoint if needed

## 📈 Monitoring

- Monitor webhook response times
- Track job post completion rates
- Log all WhatsApp interactions for debugging

---

**🎉 Your WhatsApp job post creation system is now ready!**

Users can send messages to your WhatsApp Business number and create job posts through natural conversation.
