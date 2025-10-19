# FastAPI → NestJS GraphQL Integration Guide

## Overview
FastAPI analyzes CVs and posts results back to NestJS via GraphQL mutation.

## GraphQL Mutation to Use

### Mutation: `updateApplicationAnalysis`

**Endpoint:** `http://localhost:4005/api/graphql`

**Authentication:** System API Key in HTTP header
```
x-api-key: YOUR_SYSTEM_API_KEY
```

### GraphQL Mutation

```graphql
mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
  updateApplicationAnalysis(input: $input) {
    id
    cvAnalysisScore
    analyzedAt
    candidate {
      id
      email
      name
      candidateProfile {
        firstName
        lastName
        email
        phone
        linkedinUrl
      }
    }
  }
}
```

### Input Variables

```json
{
  "input": {
    "applicationId": "uuid-of-application",
    "cvAnalysisScore": 85,
    "cvAnalysisResults": "{\"match_score\": 85, \"skills_matched\": [...]}",
    "aiCvRecommendations": "Candidate shows strong alignment...",
    "aiInterviewRecommendations": "Focus interview on AI experience...",
    "candidateInfo": {
      "firstName": "Al-Hussein",
      "lastName": "Abdullah",
      "name": "Al-Hussein Abdullah",
      "email": "al-hussein@papayatrading.com",
      "phone": "+962796026659",
      "linkedinUrl": null,
      "portfolioUrl": null,
      "location": "Amman/Jordan",
      "bio": "Results-driven entrepreneur...",
      "skills": ["Strategic thinking", "Business development", ...],
      "experience": "Founder & CEO of multiple companies...",
      "education": "BBA in Business Administration..."
    }
  }
}
```

## Python/FastAPI Example

```python
import httpx
import json

async def post_cv_analysis_results(
    application_id: str,
    cv_score: int,
    analysis_results: dict,
    cv_recommendations: str,
    interview_recommendations: str,
    candidate_info: dict,
    callback_url: str,
    system_api_key: str
):
    """Post CV analysis results back to NestJS GraphQL"""
    
    mutation = """
    mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
      updateApplicationAnalysis(input: $input) {
        id
        cvAnalysisScore
        analyzedAt
        candidate {
          id
          email
          candidateProfile {
            firstName
            lastName
            email
            phone
          }
        }
      }
    }
    """
    
    variables = {
        "input": {
            "applicationId": application_id,
            "cvAnalysisScore": cv_score,
            "cvAnalysisResults": json.dumps(analysis_results),
            "aiCvRecommendations": cv_recommendations,
            "aiInterviewRecommendations": interview_recommendations,
            "candidateInfo": candidate_info  # This will update the anonymous candidate
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": system_api_key
    }
    
    payload = {
        "query": mutation,
        "variables": variables
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            callback_url,
            json=payload,
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise Exception(f"GraphQL error: {response.text}")
        
        result = response.json()
        
        if "errors" in result:
            raise Exception(f"GraphQL errors: {result['errors']}")
        
        return result["data"]["updateApplicationAnalysis"]
```

## Candidate Info Fields

All fields in `candidateInfo` are optional. Include whatever was extracted from the CV:

- `firstName` (string) - Candidate's first name
- `lastName` (string) - Candidate's last name  
- `name` (string) - Full name
- `email` (string) - Email address
- `phone` (string) - Phone number with country code
- `linkedinUrl` (string) - LinkedIn profile URL
- `portfolioUrl` (string) - Portfolio/website URL
- `location` (string) - Location (city/country)
- `bio` (string) - Professional summary/bio
- `skills` (array of strings) - List of skills
- `experience` (string) - Work experience summary
- `education` (string) - Education summary

## What Happens

1. **NestJS receives the mutation** → Validates API key
2. **Updates application** → Saves CV analysis score and results
3. **Updates candidate profile** → Replaces placeholder data with real data from CV:
   - Email: `anonymous-123@placeholder.temp` → `al-hussein@papayatrading.com`
   - Name: `Anonymous anonymous-123` → `Al-Hussein Abdullah`
   - Phone: `null` → `+962796026659`
   - Skills, experience, etc. are populated
4. **Returns updated application** → With real candidate data

## Testing

### With Real Application ID

First, get a real application ID from the database, then test:
```bash
npx tsx test-system-api-key.ts
```

### Quick Auth Test (without real data)

```bash
curl -X POST http://localhost:4005/api/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -d '{
    "query": "{ __schema { queryType { name } } }"
  }'
```

If you get a response (not "Forbidden resource"), authentication is working!

## Environment Variables

Make sure these are set in FastAPI:
- `GRAPHQL_API_URL` - GraphQL endpoint (http://localhost:4005/api/graphql)
- `SYSTEM_API_KEY` - System API key for authentication

## Common Errors

### "Unknown type AnalyzeCVInput"
❌ Using old mutation that was removed  
✅ Use `updateApplicationAnalysis` mutation

### "Forbidden resource"
❌ Missing or invalid API key  
✅ Add `x-api-key` header with system API key: `31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e`

**Authentication works now!** The `ApiKeyService.validateApiKey()` method checks:
1. First: Does the key match `SYSTEM_API_KEY` environment variable? ✅
2. Then: Is it in the database `api_keys` table?

### Candidate profile not updating
❌ `candidateInfo` field not included or wrong format  
✅ Include `candidateInfo` object with extracted data
