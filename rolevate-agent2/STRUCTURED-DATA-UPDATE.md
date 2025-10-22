# Structured Experience & Education Update

## Overview

The FastAPI CV Analysis Agent has been updated to extract and send **structured arrays** for work experience and education, providing much richer data quality and enabling advanced features in the NestJS backend.

## What Changed?

### ✅ Updated Files

1. **`cvagent/nodes/extract_info.py`**
   - Enhanced GPT-4 extraction prompt to request structured arrays
   - Added data cleaning and validation functions
   - Better date normalization (ISO 8601 format)
   - Phone number cleaning with country code support
   - Fallback to string format when structured extraction fails

2. **`cvagent/tools/graphql_tool.py`**
   - Added support for `githubUrl` field
   - Enhanced logging to show data format (array vs string)
   - Better visibility into what's being sent to NestJS

3. **`cvagent/utils/data_examples.py`** (NEW)
   - Example structured and string data formats
   - Validation utilities
   - Testing helpers

## Data Format

### Structured Format (RECOMMENDED)

```python
{
    "firstName": "Ahmad",
    "lastName": "Ali",
    "email": "ahmad@example.com",
    "phone": "+962791234567",
    "location": "Amman, Jordan",
    "bio": "Software engineer with 5+ years of experience...",
    "linkedinUrl": "https://linkedin.com/in/ahmad",
    "githubUrl": "https://github.com/ahmad",
    "portfolioUrl": "https://ahmad.dev",
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
    
    "experience": [
        {
            "company": "Tech Corp",
            "position": "Senior Software Engineer",
            "startDate": "2021-03",
            "endDate": None,
            "isCurrent": True,
            "description": "Leading microservices development..."
        },
        {
            "company": "StartupXYZ",
            "position": "Software Engineer",
            "startDate": "2019-06",
            "endDate": "2021-02",
            "isCurrent": False,
            "description": "Built RESTful APIs..."
        }
    ],
    
    "education": [
        {
            "institution": "Jordan University",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2016-09",
            "endDate": "2018-06",
            "grade": "3.8/4.0",
            "description": "Thesis on distributed systems"
        }
    ]
}
```

### String Format (Still Supported - Backward Compatible)

```python
{
    "firstName": "Sarah",
    "lastName": "Mohammed",
    "email": "sarah@example.com",
    "skills": ["Marketing", "SEO"],
    "experience": "Marketing Manager at ABC Corp (2020-Present); Specialist at XYZ (2018-2020)",
    "education": "MBA from American University (2016-2018); BS from Jordan University (2012-2016)"
}
```

## How It Works

### 1. CV Text Extraction

The parser extracts text from PDF/DOCX files (unchanged).

### 2. GPT-4 Structured Extraction

The updated prompt asks GPT-4 to extract data in structured format:

```python
extraction_prompt = """
Extract information from this CV in JSON format:

{
  "experience": [
    {
      "company": "...",
      "position": "...",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null if current",
      "isCurrent": true/false,
      "description": "..."
    }
  ],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "fieldOfStudy": "...",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "grade": "...",
      "description": "..."
    }
  ]
}
"""
```

### 3. Data Cleaning & Validation

New helper functions clean and validate the extracted data:

- `clean_candidate_data()` - Main cleaning function
- `clean_experience()` - Validates experience entries
- `clean_education()` - Validates education entries
- `normalize_date()` - Converts dates to ISO 8601
- `clean_phone_number()` - Adds country code if missing

### 4. Sending to NestJS

The GraphQL mutation sends the data (array or string):

```python
mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
    updateApplicationAnalysis(input: $input) {
        candidate {
            candidateProfile {
                experience  # Can be string or array
                education   # Can be string or array
            }
        }
    }
}
```

## Benefits

### For Data Quality
✅ **Structured, queryable data** instead of free text  
✅ **Timeline views** showing career progression  
✅ **Smart filtering** by company, university, dates  
✅ **Analytics** on industry trends, popular schools  

### For User Experience
✅ **Professional presentation** - Resume-like display  
✅ **Better matching** - More accurate job compatibility  
✅ **Career insights** - Years of experience, education level  

### For Developers
✅ **Backward compatible** - String format still works  
✅ **Flexible** - Handles missing fields gracefully  
✅ **Well-logged** - Clear visibility into extraction process  

## Testing

### Run the Validation Utility

```bash
python -m cvagent.utils.data_examples
```

This will test both structured and string formats.

### Test with Real CV

```bash
# Start the FastAPI server
uvicorn main:app --reload

# Send test request
curl -X POST http://localhost:8000/cv-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "cv_link": "s3://bucket/path/to/cv.pdf",
    "jobid": "job-123",
    "application_id": "app-456",
    "candidateid": "candidate-789",
    "systemApiKey": "your-api-key"
  }'
```

### Expected Log Output

```
✅ Extracted candidate info via OpenAI
   - Basic fields: ['firstName', 'lastName', 'email', 'phone', 'location', ...]
   - Skills: 8 found
   - Experience: 3 entries (array format)
   - Education: 2 entries (array format)

🔄 Updating application app-456 with candidate info:
   Basic fields: ['firstName', 'lastName', 'email', 'phone', ...]
   Skills: 8 skills
   📋 Experience: array format (3 entries)
   🎓 Education: array format (2 entries)

📤 Posting CV analysis results to NestJS GraphQL...
✅ Application analysis updated successfully
```

## Fallback Strategy

If GPT-4 can't extract structured data (messy CV, unusual format):

1. **Try structured extraction first**
2. **Validate the arrays have data**
3. **If validation fails, fall back to string format**
4. **Log warnings so you know what happened**

The code handles this automatically - no manual intervention needed.

## Date Formats

The system accepts various date formats and normalizes them:

| Input Format | Normalized Output |
|--------------|-------------------|
| `"2020"` | `"2020-01"` |
| `"2020-03"` | `"2020-03"` |
| `"2020-03-15"` | `"2020-03-15"` |
| `"202003"` | `"2020-03"` |

## Phone Numbers

Phone numbers are automatically cleaned and country codes added:

| Input | Output |
|-------|--------|
| `"0791234567"` | `"+962791234567"` |
| `"791234567"` | `"+962791234567"` |
| `"+962791234567"` | `"+962791234567"` (unchanged) |

Default country code is Jordan (+962). This can be customized in `clean_phone_number()`.

## Error Handling

### Extraction Errors

If OpenAI fails, the system falls back to regex extraction:

```python
try:
    extracted_data = parse_cv_with_gpt4(cv_text)
except Exception as e:
    print(f"❌ OpenAI extraction error: {e}")
    extracted_data = extract_with_regex(text)  # Fallback
```

### Validation Errors

Missing required fields are logged but don't stop the process:

```python
# Optional fields are omitted if not found
if extracted.get("bio"):
    candidate_info["bio"] = extracted["bio"]
# If no bio, it's simply not included
```

## Configuration

### Environment Variables

Make sure these are set in your `.env`:

```bash
OPENAI_API_KEY=sk-...
GRAPHQL_API_URL=http://localhost:4005/api/graphql
SYSTEM_API_KEY=31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
```

### GPT-4 Model

Currently using `gpt-4o-mini` for cost efficiency. For better accuracy, switch to `gpt-4`:

```python
# In cvagent/nodes/extract_info.py
response = client.chat.completions.create(
    model="gpt-4",  # Changed from gpt-4o-mini
    messages=[...],
    temperature=0.1
)
```

## Migration Guide

### From Old Version

No breaking changes! Your existing code will continue to work:

**Before:**
```python
# Old extraction returned strings
extracted = {
    "experience": "Software Engineer at Google (2020-Present)",
    "education": "MS in CS from MIT"
}
```

**After:**
```python
# New extraction returns arrays (but strings still work)
extracted = {
    "experience": [
        {"company": "Google", "position": "Software Engineer", ...}
    ],
    "education": [
        {"institution": "MIT", "degree": "MS", "fieldOfStudy": "CS", ...}
    ]
}
```

### NestJS Backend

The NestJS backend already supports both formats (as of your recent update). No changes needed on that side.

## Troubleshooting

### GPT-4 Returns Strings Instead of Arrays

**Possible causes:**
- CV text is unclear or poorly formatted
- Not enough experience/education data in CV
- GPT-4 couldn't parse dates reliably

**Solution:** The fallback mechanism will handle this. Check logs for warnings.

### Missing Fields in Arrays

**Possible causes:**
- Information not present in CV
- GPT-4 couldn't extract with confidence

**Solution:** Arrays will contain only the fields that were found. Optional fields are omitted.

### Date Format Issues

**Possible causes:**
- CV uses non-standard date formats
- Dates are written in words (e.g., "January 2020")

**Solution:** `normalize_date()` handles many formats. Dates that can't be parsed are passed through as-is.

## Next Steps

### Recommended Enhancements

1. **Add validation endpoint** - Test extraction without full CV analysis
2. **Support more date formats** - Handle "Jan 2020", "Spring 2020", etc.
3. **Extract certifications** - Add separate array for professional certifications
4. **Language support** - Extract spoken languages
5. **Projects section** - Extract notable projects/achievements

### Example Validation Endpoint

```python
@app.post("/validate-cv")
async def validate_cv(cv_link: str):
    """Extract and validate CV data without full analysis"""
    # Download CV
    cv_text = download_cv(cv_link)
    
    # Extract data
    extracted = extract_info({"local_path": cv_link})
    
    # Validate
    from cvagent.utils.data_examples import validate_candidate_data
    validation = validate_candidate_data(extracted)
    
    return {
        "extracted": extracted,
        "validation": validation
    }
```

## Support

**Questions or Issues?**

1. Check the logs - they're very detailed now
2. Run the validation utility to test your data
3. Review example data in `cvagent/utils/data_examples.py`

**Key Files:**
- `cvagent/nodes/extract_info.py` - Extraction logic
- `cvagent/tools/graphql_tool.py` - NestJS integration
- `cvagent/utils/data_examples.py` - Examples and validation

---

**Last Updated:** October 19, 2025  
**Version:** 2.0.0 - Structured Data Support
