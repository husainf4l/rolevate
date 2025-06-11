# N8N AI Job Post Integration Guide

This guide explains how to set up n8n workflows to power the AI-driven job post creation feature in ROLEVATE.

## Overview

The job post creation system uses three main n8n webhooks:

1. **Job Chat Processor** - Processes user messages and extracts job data
2. **Job Validator** - Validates job data completeness and quality
3. **Job Enhancer** - Enhances job descriptions using AI

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
NEXT_PUBLIC_N8N_WEBHOOK_TOKEN=your-webhook-token-here
```

### 2. N8N Workflow Endpoints

Create these three workflows in your n8n instance:

#### A. Job Chat Processor (`/webhook/job-chat-processor`)

**Purpose**: Process user chat messages and extract structured job data

**Input**:

```json
{
  "userMessage": "Senior Software Engineer",
  "currentStep": "greeting",
  "conversationHistory": [
    { "role": "user", "content": "Senior Software Engineer" },
    { "role": "assistant", "content": "Great! Which department..." }
  ],
  "extractedData": {
    "title": "",
    "department": "",
    "location": "",
    "type": "full-time",
    "description": "",
    "requirements": [],
    "benefits": []
  }
}
```

**Expected Output**:

```json
{
  "success": true,
  "data": {
    "extractedData": {
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "location": "Dubai, UAE",
      "type": "full-time",
      "description": "...",
      "requirements": ["5+ years experience", "React expertise"],
      "benefits": ["Competitive salary", "Health insurance"]
    },
    "nextQuestion": "Great! Which department will this role be part of?",
    "confidence": 0.92,
    "suggestions": ["Engineering", "Technology", "Product", "R&D"]
  }
}
```

#### B. Job Validator (`/webhook/job-validator`)

**Purpose**: Validate job data and provide improvement suggestions

**Input**:

```json
{
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "location": "Dubai, UAE",
  "type": "full-time",
  "description": "We are looking for a senior software engineer...",
  "requirements": ["5+ years experience", "React expertise"],
  "benefits": ["Competitive salary", "Health insurance"]
}
```

**Expected Output**:

```json
{
  "isValid": true,
  "suggestions": [
    "Consider adding salary range to benefits",
    "Job description could include team size information"
  ],
  "score": 0.85
}
```

#### C. Job Enhancer (`/webhook/job-enhancer`)

**Purpose**: Enhance job descriptions using AI

**Input**:

```json
{
  "description": "We need a software engineer to work on our platform",
  "title": "Senior Software Engineer",
  "department": "Engineering"
}
```

**Expected Output**:

```json
{
  "enhancedDescription": "We are seeking a highly skilled Senior Software Engineer to join our dynamic Engineering team. In this role, you will design, develop, and maintain scalable software solutions..."
}
```

## Sample N8N Workflow Nodes

### Job Chat Processor Workflow

1. **Webhook Trigger**

   - Method: POST
   - Path: `/job-chat-processor`
   - Authentication: Bearer Token

2. **OpenAI/Claude API Node**

   - System prompt: "You are an AI assistant helping to extract job posting information..."
   - Model: gpt-4 or claude-3-sonnet
   - Parse user message and extract relevant data

3. **JavaScript Function Node**

   - Process extracted data
   - Generate next question based on current step
   - Calculate confidence score
   - Provide suggestions

4. **HTTP Response Node**
   - Return structured JSON response

### Job Enhancer Workflow

1. **Webhook Trigger**

   - Method: POST
   - Path: `/job-enhancer`

2. **OpenAI API Node**

   - System prompt: "Enhance this job description to be more engaging and professional..."
   - Include industry-specific language
   - Improve clarity and appeal

3. **HTTP Response Node**
   - Return enhanced description

## Testing

You can test the workflows using tools like Postman or curl:

```bash
# Test Job Chat Processor
curl -X POST https://your-n8n-instance.com/webhook/job-chat-processor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-token" \
  -d '{
    "userMessage": "Senior Software Engineer",
    "currentStep": "greeting",
    "conversationHistory": [],
    "extractedData": {}
  }'
```

## Fallback Behavior

If n8n is unavailable, the system automatically falls back to local processing logic, ensuring the feature continues to work even during n8n downtime.

## Error Handling

- All API calls include proper error handling
- Failed requests fall back to local processing
- Users receive seamless experience regardless of n8n status

## Security Considerations

- Use HTTPS for all webhook URLs
- Implement proper authentication tokens
- Validate all input data in n8n workflows
- Consider rate limiting for production use

## Monitoring

Monitor these metrics in your n8n instance:

- Webhook response times
- Success/failure rates
- AI model performance
- User satisfaction with generated content
