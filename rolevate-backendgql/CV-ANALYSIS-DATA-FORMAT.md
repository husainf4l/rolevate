# CV Analysis Data Format Guide

## Overview
This document defines the **professional data format** for CV analysis results that FastAPI should send to the NestJS GraphQL backend. The backend now supports both **simple string summaries** and **structured relational data** for work experience and education.

---

## GraphQL Mutation Endpoint

**Mutation:** `updateApplicationAnalysis`

**Endpoint:** `http://localhost:4005/api/graphql`

**Authentication:** API Key in header
```http
X-API-Key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
```

---

## Complete Request Format

### GraphQL Mutation Structure

```graphql
mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
  updateApplicationAnalysis(input: $input) {
    id
    status
    cvAnalysisScore
    analyzedAt
    candidate {
      id
      email
      candidateProfile {
        id
        firstName
        lastName
        phone
        location
        bio
        skills
        experience
        education
        linkedinUrl
        githubUrl
        portfolioUrl
      }
    }
  }
}
```

### Input Variables Schema

```typescript
{
  "input": {
    "applicationId": string,              // Required: UUID of the application
    "cvAnalysisScore": number,            // Optional: Score 0-100
    "cvAnalysisResults": string | object, // Optional: JSON string or object
    "aiCvRecommendations": string,        // Optional: AI recommendations text
    "aiInterviewRecommendations": string, // Optional: Interview questions
    "candidateInfo": {                    // Optional but recommended
      "firstName": string,
      "lastName": string,
      "email": string,
      "phone": string,
      "location": string,
      "bio": string,
      "skills": string[],
      "linkedinUrl": string,
      "githubUrl": string,
      "portfolioUrl": string,
      
      // Experience can be either:
      // Option 1: Simple string summary
      "experience": "5 years as Software Engineer at Google; 3 years as Developer at Microsoft",
      
      // Option 2: Structured array (RECOMMENDED for best practice)
      "experience": [
        {
          "company": string,              // Required: Company name
          "position": string,             // Required: Job title/position
          "startDate": string | Date,     // Optional: ISO date or "YYYY-MM"
          "endDate": string | Date | null,// Optional: ISO date or null if current
          "isCurrent": boolean,           // Optional: true if currently working here
          "description": string           // Optional: Job responsibilities/achievements
        }
      ],
      
      // Education can be either:
      // Option 1: Simple string summary
      "education": "Bachelor of Science in Computer Science from MIT; Master in AI from Stanford",
      
      // Option 2: Structured array (RECOMMENDED for best practice)
      "education": [
        {
          "institution": string,          // Required: School/University name
          "degree": string,               // Required: Degree type (BS, MS, PhD, etc.)
          "fieldOfStudy": string,         // Optional: Major/field
          "startDate": string | Date,     // Optional: ISO date or "YYYY"
          "endDate": string | Date,       // Optional: Graduation date
          "grade": string,                // Optional: GPA or grade
          "description": string           // Optional: Achievements, honors
        }
      ]
    }
  }
}
```

---

## Professional Examples

### Example 1: Structured Data (RECOMMENDED)

```json
{
  "input": {
    "applicationId": "123e4567-e89b-12d3-a456-426614174000",
    "cvAnalysisScore": 85,
    "aiCvRecommendations": "Strong technical background with 8 years of experience. Excellent fit for senior roles.",
    "aiInterviewRecommendations": "Focus on system design questions and leadership experience.",
    "candidateInfo": {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@email.com",
      "phone": "+962791234567",
      "location": "Amman, Jordan",
      "bio": "Passionate software engineer with expertise in cloud architecture and team leadership. Proven track record of building scalable systems.",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes"],
      "linkedinUrl": "https://linkedin.com/in/sarahjohnson",
      "githubUrl": "https://github.com/sarahj",
      "portfolioUrl": "https://sarahjohnson.dev",
      
      "experience": [
        {
          "company": "Amazon Web Services",
          "position": "Senior Software Engineer",
          "startDate": "2020-03-15",
          "endDate": null,
          "isCurrent": true,
          "description": "Leading a team of 5 engineers building serverless infrastructure. Reduced deployment time by 60% through CI/CD automation."
        },
        {
          "company": "Microsoft",
          "position": "Software Engineer II",
          "startDate": "2017-06-01",
          "endDate": "2020-02-28",
          "isCurrent": false,
          "description": "Developed features for Azure DevOps. Improved API performance by 40% through database optimization."
        },
        {
          "company": "Startup Inc",
          "position": "Junior Developer",
          "startDate": "2015-09-01",
          "endDate": "2017-05-31",
          "isCurrent": false,
          "description": "Built RESTful APIs and React components for e-commerce platform."
        }
      ],
      
      "education": [
        {
          "institution": "Massachusetts Institute of Technology",
          "degree": "Master of Science",
          "fieldOfStudy": "Computer Science",
          "startDate": "2013-09-01",
          "endDate": "2015-06-30",
          "grade": "3.9/4.0",
          "description": "Specialization in Distributed Systems. Thesis on microservices architecture."
        },
        {
          "institution": "University of Jordan",
          "degree": "Bachelor of Science",
          "fieldOfStudy": "Software Engineering",
          "startDate": "2009-09-01",
          "endDate": "2013-06-30",
          "grade": "3.8/4.0",
          "description": "Dean's List all semesters. President of Computer Science Club."
        }
      ]
    }
  }
}
```

### Example 2: Simple String Format (Acceptable)

```json
{
  "input": {
    "applicationId": "123e4567-e89b-12d3-a456-426614174000",
    "cvAnalysisScore": 75,
    "candidateInfo": {
      "firstName": "Ahmad",
      "lastName": "Ali",
      "email": "ahmad.ali@email.com",
      "phone": "+962795555555",
      "location": "Irbid, Jordan",
      "bio": "Full-stack developer with passion for clean code",
      "skills": ["Python", "Django", "PostgreSQL", "React"],
      "linkedinUrl": "https://linkedin.com/in/ahmadali",
      
      "experience": "Software Developer at TechCorp (2020-Present): Building web applications with Django and React. Junior Developer at StartupX (2018-2020): Created RESTful APIs and database schemas.",
      
      "education": "Bachelor of Computer Science from Jordan University of Science and Technology (2014-2018), Grade: Very Good"
    }
  }
}
```

---

## Backend Processing Logic

### What Happens with Each Format

#### Structured Array Format:
1. **Creates individual database records** in `work_experience` and `education` tables
2. **Links records** to the candidate profile (relational integrity)
3. **Generates summary text** from structured data for quick display
4. **Stores both** structured records AND summary text

**Benefits:**
- ✅ Proper relational database structure
- ✅ Can query and filter by company, degree, dates
- ✅ Can display timeline views
- ✅ Easy to update individual entries
- ✅ Better data integrity and validation

#### String Format:
1. **Stores text directly** in `candidate_profile.experience` and `candidate_profile.education` columns
2. **No separate records** created
3. **Quick to implement** but less flexible

**Limitations:**
- ⚠️ Cannot query by specific company or school
- ⚠️ Cannot filter by date ranges
- ⚠️ Harder to update specific entries
- ⚠️ Less structured for analytics

---

## Field Mappings & Aliases

The backend handles various field name formats:

### Experience Fields:
- `company` = `organization` (alias)
- `position` = `title` = `role` (aliases)
- `startDate` = `start_date` (alias)
- `endDate` = `end_date` (alias)
- `isCurrent` = `is_current` (alias)
- `description` = `responsibilities` (alias)

### Education Fields:
- `institution` = `school` = `university` (aliases)
- `degree` = `qualification` (alias)
- `fieldOfStudy` = `field_of_study` = `major` (aliases)
- `endDate` = `graduationDate` (alias)

### Date Handling:
- Accepts: ISO strings, Date objects, "YYYY-MM-DD", "YYYY-MM", "YYYY"
- Special values: `"Present"`, `"Current"`, `"Now"` → `null` (for ongoing)
- Invalid dates → `null` (graceful fallback)

---

## Best Practices for FastAPI Agent

### 1. **Always Extract Structured Data When Possible**

Use GPT-4 to parse CVs into structured JSON:

```python
# Good: Extract structured experience
experience_data = [
    {
        "company": "Google",
        "position": "Software Engineer",
        "startDate": "2020-01",
        "endDate": None,
        "isCurrent": True,
        "description": "Built scalable microservices"
    }
]
```

### 2. **Fallback to Strings When Structure is Unclear**

If CV format is messy or unstructured:

```python
# Acceptable fallback
experience_data = "Software Engineer at Google (2020-Present); Developer at Microsoft (2018-2020)"
```

### 3. **Validate Phone Numbers**

Ensure phone has country code:
```python
# Clean and validate
phone = "+962791234567"  # International format
```

### 4. **Extract All Available URLs**

```python
{
    "linkedinUrl": "https://linkedin.com/in/...",
    "githubUrl": "https://github.com/...",
    "portfolioUrl": "https://..."
}
```

### 5. **Use Consistent Date Formats**

```python
# ISO 8601 format (preferred)
"startDate": "2020-03-15"

# Or just year-month
"startDate": "2020-03"

# For current positions
"endDate": None  # or null
"isCurrent": True
```

### 6. **Extract Comprehensive Skills Array**

```python
# Good
"skills": ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker"]

# Not as good
"skills": ["JavaScript, TypeScript, React"]  # Don't comma-separate within strings
```

---

## Error Handling

The backend handles errors gracefully:

- **Missing required fields**: Uses defaults or "Not specified"
- **Invalid dates**: Converts to `null`
- **Missing profile**: Creates new profile automatically
- **Duplicate data**: Updates existing records instead of creating duplicates
- **Experience/education processing errors**: Logs error but continues with other data

---

## Testing the Integration

### cURL Example:

```bash
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -d '{
    "query": "mutation($input: UpdateApplicationAnalysisInput!) { updateApplicationAnalysis(input: $input) { id status cvAnalysisScore } }",
    "variables": {
      "input": {
        "applicationId": "YOUR_APP_ID",
        "cvAnalysisScore": 85,
        "candidateInfo": {
          "firstName": "Test",
          "lastName": "User",
          "email": "test@example.com",
          "phone": "+962791234567",
          "skills": ["JavaScript", "Python"],
          "experience": [
            {
              "company": "Test Corp",
              "position": "Developer",
              "startDate": "2020-01-01",
              "isCurrent": true
            }
          ]
        }
      }
    }
  }'
```

### Python Example:

```python
import httpx

async def update_application_analysis(
    application_id: str,
    candidate_data: dict,
    score: float
):
    mutation = """
    mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
      updateApplicationAnalysis(input: $input) {
        id
        status
        cvAnalysisScore
      }
    }
    """
    
    variables = {
        "input": {
            "applicationId": application_id,
            "cvAnalysisScore": score,
            "candidateInfo": candidate_data
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:4005/api/graphql",
            json={"query": mutation, "variables": variables},
            headers={
                "X-API-Key": "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        
        return response.json()
```

---

## Summary

### For FastAPI Agent:

✅ **DO:**
- Send structured arrays for experience and education when possible
- Include all extracted fields (name, phone, location, bio, skills, URLs)
- Use ISO date formats
- Include `isCurrent: true` for ongoing positions
- Validate and clean phone numbers
- Send comprehensive skills arrays

❌ **DON'T:**
- Skip experience/education data - always send what you extract
- Use inconsistent date formats
- Forget country codes on phone numbers
- Send malformed JSON
- Include sensitive data in logs

### The backend will:
- ✅ Handle both string and structured formats
- ✅ Create proper database relationships for structured data
- ✅ Generate summaries from structured data
- ✅ Validate and clean all data
- ✅ Handle errors gracefully without failing the whole process
- ✅ Avoid duplicates by updating existing records

---

**Last Updated:** October 19, 2025
**Version:** 2.0 (Professional Structured Data Support)
