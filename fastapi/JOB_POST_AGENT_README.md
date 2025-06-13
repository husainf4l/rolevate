# Job Post Creation Agent API Documentation

## Overview

The Job Post Creation Agent is an intelligent HR expert system that helps users create compelling job posts through conversational AI. It uses GPT-4 to provide expert guidance and best practices for crafting job descriptions that attract top talent.

## 🆕 NEW: Session Management Support

The agent now includes **full chat ID session management** for maintaining conversation state across multiple API requests. This enables true conversational experiences where users can:

- Resume conversations after interruptions
- Build job posts incrementally over multiple sessions
- Maintain context and progress across server restarts
- Have natural, multi-turn conversations

For detailed session management documentation, see [SESSION_MANAGEMENT_README.md](SESSION_MANAGEMENT_README.md).

## Features

- 🤖 **AI HR Expert**: Powered by GPT-4 with 15+ years of HR expertise
- 💬 **Conversational Flow**: Step-by-step guidance through job post creation
- 🎯 **Best Practices**: Provides tips and suggestions for optimal job descriptions
- 🔗 **NestJS Integration**: Automatically sends completed job posts to your backend
- 📝 **Comprehensive Data Collection**: Collects all essential job post information
- 🆕 **Session Management**: Maintains conversation state across requests
- 🆕 **Resume Capability**: Users can return to incomplete job posts
- 🆕 **Intelligent Completion**: Automatically detects when ready to finalize

## API Endpoints

### 1. Create Job Post with Session Management

**Endpoint:** `POST /create-job-post`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `message` (required): Initial message about the job post
- `company_id` (required): UUID of the company creating the job post
- `company_name` (optional): Name of the company
- `session_id` (optional): **NEW** - Session ID to resume existing conversation

**Example Request (New Session):**

```bash
curl -X POST "http://localhost:8000/create-job-post" \
  -F "message=I want to create a job post for a Senior Software Engineer" \
  -F "company_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "company_name=TechCorp Solutions"
```

**Example Request (Resume Session):**

```bash
curl -X POST "http://localhost:8000/create-job-post" \
  -F "message=hello" \
  -F "company_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "company_name=TechCorp Solutions" \
  -F "session_id=90c811b9-ff13-4d19-a752-a94cf04de1aa"
```

**Example Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "company_id": "123e4567-e89b-12d3-a456-426614174000",
  "company_name": "TechCorp Solutions",
  "agent_response": "👋 Hello! I'm your AI HR Expert, and I'm excited to help you create an outstanding job post for TechCorp Solutions!...",
  "is_complete": false,
  "job_data": {
    "title": "",
    "experienceLevel": "",
    "skills": []
    // ... other job fields
  },
  "current_step": "getting_basic_info"
}
```

**Endpoint:** `POST /job-post-chat`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `message` (required): Continuation message for the conversation
- `session_id` (required): **NEW** - Session ID for conversation continuity
- `company_id` (optional): Company identifier for validation
- `company_name` (optional): Company name

**Example Request:**

```bash
curl -X POST "http://localhost:8000/job-post-chat" \
  -F "message=Senior level with 5+ years experience in React and Node.js" \
  -F "session_id=90c811b9-ff13-4d19-a752-a94cf04de1aa"
```

**Example Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "agent_response": "Excellent! A senior developer with React and Node.js experience is a great choice...",
  "is_complete": false,
  "job_data": {
    "title": "Senior Software Engineer",
    "experienceLevel": "senior",
    "skills": ["react", "node.js"]
    // ... updated job fields
  },
  "current_step": "collecting_details"
}
```

### 3. Get Session Information

**Endpoint:** `GET /job-post-session/{session_id}`

**Example Request:**

```bash
curl -X GET "http://localhost:8000/job-post-session/90c811b9-ff13-4d19-a752-a94cf04de1aa"
```

**Example Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "company_id": "123e4567-e89b-12d3-a456-426614174000",
  "company_name": "TechCorp Solutions",
  "created_at": "2025-06-13T15:55:59.947583",
  "last_updated": "2025-06-13T16:02:30.123456",
  "current_step": "collecting_details",
  "is_complete": false,
  "conversation_turns": 5,
  "job_data": {
    /* current job data */
  }
}
```

### 4. Delete Session

**Endpoint:** `DELETE /job-post-session/{session_id}`

**Example Request:**

```bash
curl -X DELETE "http://localhost:8000/job-post-session/90c811b9-ff13-4d19-a752-a94cf04de1aa"
```

### Legacy Endpoints (Deprecated)

The original endpoints without session management are still supported but deprecated:

**Endpoint:** `POST /job-post-chat`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `message` (required): User's response or continuation
- `company_id` (required): UUID of the company
- `company_name` (optional): Name of the company
- `session_id` (optional): Session ID for conversation continuity (future feature)

**Example Request:**

```bash
curl -X POST "http://localhost:8000/job-post-chat" \
  -F "message=Senior Full-Stack Developer with React and Node.js expertise" \
  -F "company_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "company_name=TechCorp Solutions"
```

## Conversation Flow

The AI HR Expert guides users through these steps:

1. **Job Title** - Specific, compelling job title
2. **Department & Location** - Department and location details
3. **Employment Details** - Employment type, experience level, remote policy
4. **Salary & Benefits** - Salary range and benefits package
5. **Description & Responsibilities** - Job description and key responsibilities
6. **Requirements & Qualifications** - Required skills, qualifications, experience
7. **Final Review** - Review and finalize all details
8. **Complete** - Submit to NestJS API

## Job Post Data Structure

The agent collects the following information:

```json
{
  "title": "Senior Full-Stack Developer",
  "department": "Engineering",
  "location": "New York, NY / Remote",
  "employment_type": "full-time",
  "experience_level": "senior",
  "salary_range": {
    "min": 120000,
    "max": 160000,
    "currency": "USD"
  },
  "description": "We are seeking a talented Senior Full-Stack Developer...",
  "responsibilities": [
    "Design and develop scalable web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers"
  ],
  "requirements": [
    "5+ years of full-stack development experience",
    "Proficiency in React and Node.js",
    "Experience with cloud platforms"
  ],
  "qualifications": [
    "Bachelor's degree in Computer Science or related field",
    "Strong problem-solving skills"
  ],
  "benefits": [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "Flexible PTO policy"
  ],
  "skills": ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
  "remote_policy": "hybrid",
  "application_deadline": "2025-08-01"
}
```

## Environment Configuration

Add these variables to your `.env` file:

```properties
# NestJS API Configuration
NESTJS_API_BASE_URL=http://localhost:3000
NESTJS_API_TOKEN=your-api-token-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

## NestJS Webhook Integration

When a job post is completed, the agent sends a POST request to:

**Endpoint:** `{NESTJS_API_BASE_URL}/api/job-posts`

**Payload:**

```json
{
  "title": "Senior Full-Stack Developer",
  "department": "Engineering",
  "location": "New York, NY / Remote",
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "salaryRange": {
    "min": 120000,
    "max": 160000,
    "currency": "USD"
  },
  "description": "Job description...",
  "responsibilities": ["..."],
  "requirements": ["..."],
  "qualifications": ["..."],
  "benefits": ["..."],
  "skills": ["..."],
  "remotePolicy": "hybrid",
  "applicationDeadline": "2025-08-01",
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "companyName": "TechCorp Solutions",
  "status": "active",
  "createdBy": "ai-agent",
  "metadata": {
    "createdVia": "ai-hr-agent",
    "source": "fastapi-job-post-agent"
  }
}
```

## Testing

Run the test script to see the agent in action:

```bash
python test_job_post_agent.py
```

## Error Handling

The agent handles various error scenarios:

- **OpenAI API errors**: Falls back with error message and continues conversation
- **NestJS API errors**: Creates job post locally but reports API submission failure
- **Validation errors**: Provides guidance on missing or invalid data
- **Network errors**: Detailed error messages with troubleshooting guidance

## Best Practices

The AI HR Expert provides guidance on:

- **Compelling job titles**: Specific over generic (e.g., "Senior React Developer" vs "Developer")
- **Clear responsibilities**: Action-oriented bullet points
- **Realistic requirements**: Must-have vs nice-to-have qualifications
- **Competitive benefits**: Market-appropriate compensation and perks
- **Inclusive language**: Welcoming to diverse candidates
- **Company culture**: Highlights what makes the company unique
