# API Usage Guide - Rolevate CV Filler Agent

Complete guide for integrating the CV Filler Agent API into your applications.

## 🌐 Base URL

```
http://localhost:8000
```

For production, replace with your deployed URL.

## 📡 API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the service is running

**Response:**
```json
{
  "status": "healthy"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

---

### 2. List Templates

**Endpoint:** `GET /api/v1/templates`

**Description:** Get all available CV templates

**Response:**
```json
{
  "templates": ["modern", "professional", "creative"]
}
```

**Example:**
```bash
curl http://localhost:8000/api/v1/templates
```

---

### 3. Extract CV Data

**Endpoint:** `POST /api/v1/cv/extract`

**Description:** Extract structured data from uploaded CV

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: CV file (PDF, DOCX, TXT, or JSON)
  - `enhance`: boolean (optional, default: false)

**Response:**
```json
{
  "full_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "contact": {
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA"
  },
  "summary": "Experienced software engineer...",
  "experience": [...],
  "education": [...],
  "skills": [...]
}
```

**Examples:**

```bash
# Basic extraction
curl -X POST "http://localhost:8000/api/v1/cv/extract" \
  -F "file=@cv.pdf"

# With enhancement
curl -X POST "http://localhost:8000/api/v1/cv/extract" \
  -F "file=@cv.pdf" \
  -F "enhance=true"
```

**Python:**
```python
import requests

url = "http://localhost:8000/api/v1/cv/extract"
files = {"file": open("cv.pdf", "rb")}
data = {"enhance": "true"}

response = requests.post(url, files=files, data=data)
cv_data = response.json()
print(cv_data)
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('enhance', 'true');

const response = await fetch('http://localhost:8000/api/v1/cv/extract', {
  method: 'POST',
  body: formData
});

const cvData = await response.json();
console.log(cvData);
```

---

### 4. Fill Template

**Endpoint:** `POST /api/v1/cv/fill`

**Description:** Fill CV template with provided data

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "full_name": "John Doe",
  "job_title": "Software Engineer",
  ...
}
```
- Query Parameters:
  - `template_name`: Template name (default: "modern")
  - `output_format`: "pdf" or "docx" (default: "pdf")

**Response:** Binary file (PDF or DOCX)

**Examples:**

```bash
# Fill and download PDF
curl -X POST "http://localhost:8000/api/v1/cv/fill?template_name=modern&output_format=pdf" \
  -H "Content-Type: application/json" \
  -d @cv_data.json \
  --output filled_cv.pdf

# Fill and download DOCX
curl -X POST "http://localhost:8000/api/v1/cv/fill?template_name=professional&output_format=docx" \
  -H "Content-Type: application/json" \
  -d @cv_data.json \
  --output filled_cv.docx
```

**Python:**
```python
import requests

url = "http://localhost:8000/api/v1/cv/fill"
params = {
    "template_name": "modern",
    "output_format": "pdf"
}
cv_data = {
    "full_name": "John Doe",
    "job_title": "Software Engineer",
    "contact": {"email": "john@example.com"},
    "skills": ["Python", "React", "AWS"]
}

response = requests.post(url, json=cv_data, params=params)

with open("filled_cv.pdf", "wb") as f:
    f.write(response.content)
```

---

### 5. Process CV (Complete Pipeline)

**Endpoint:** `POST /api/v1/cv/process`

**Description:** Upload CV, extract data, fill template, and generate output in one step

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: CV file
  - `template_name`: Template name (default: "modern")
  - `output_format`: "pdf" or "docx" (default: "pdf")
  - `enhance`: boolean (default: false)

**Response:**
```json
{
  "success": true,
  "message": "CV processed successfully",
  "file_path": "/path/to/output.pdf",
  "download_url": "/api/v1/cv/download/output.pdf",
  "cv_data": {
    "full_name": "John Doe",
    ...
  }
}
```

**Examples:**

```bash
# Process CV with default settings
curl -X POST "http://localhost:8000/api/v1/cv/process" \
  -F "file=@cv.pdf" \
  -F "template_name=modern" \
  -F "output_format=pdf"

# Process with enhancement
curl -X POST "http://localhost:8000/api/v1/cv/process" \
  -F "file=@cv.pdf" \
  -F "template_name=professional" \
  -F "output_format=docx" \
  -F "enhance=true"
```

**Python:**
```python
import requests

url = "http://localhost:8000/api/v1/cv/process"
files = {"file": open("cv.pdf", "rb")}
data = {
    "template_name": "modern",
    "output_format": "pdf",
    "enhance": "true"
}

response = requests.post(url, files=files, data=data)
result = response.json()

if result["success"]:
    download_url = f"http://localhost:8000{result['download_url']}"
    print(f"CV processed! Download: {download_url}")
    print(f"Candidate: {result['cv_data']['full_name']}")
```

**JavaScript/React:**
```javascript
async function processCv(file, templateName = 'modern') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('template_name', templateName);
  formData.append('output_format', 'pdf');
  formData.append('enhance', 'true');

  const response = await fetch('http://localhost:8000/api/v1/cv/process', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    // Download the generated CV
    const downloadUrl = `http://localhost:8000${result.download_url}`;
    window.open(downloadUrl, '_blank');
  }
  
  return result;
}
```

---

### 6. Download CV

**Endpoint:** `GET /api/v1/cv/download/{filename}`

**Description:** Download a previously generated CV

**Response:** Binary file (PDF or DOCX)

**Example:**
```bash
curl "http://localhost:8000/api/v1/cv/download/John_Doe_CV_abc123.pdf" \
  --output downloaded_cv.pdf
```

---

### 7. Preview CV

**Endpoint:** `POST /api/v1/cv/preview`

**Description:** Generate HTML preview of CV without exporting

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: CV data object
- Query Parameters:
  - `template_name`: Template name (default: "modern")

**Response:**
```json
{
  "html": "<!DOCTYPE html><html>...</html>"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/cv/preview?template_name=modern" \
  -H "Content-Type: application/json" \
  -d @cv_data.json
```

---

## 🔐 Authentication (Future)

Currently, the API does not require authentication. For production deployment, implement:

1. **API Key Authentication**
```bash
curl -H "X-API-Key: your-api-key" http://localhost:8000/api/v1/cv/process
```

2. **JWT Bearer Token**
```bash
curl -H "Authorization: Bearer your-jwt-token" http://localhost:8000/api/v1/cv/process
```

---

## 📊 Data Models

### CVData Schema

```json
{
  "full_name": "string (required)",
  "job_title": "string | null",
  "contact": {
    "email": "email | null",
    "phone": "string | null",
    "location": "string | null",
    "linkedin": "url | null",
    "website": "url | null",
    "github": "url | null"
  },
  "summary": "string | null",
  "experience": [
    {
      "job_title": "string (required)",
      "company": "string (required)",
      "location": "string | null",
      "start_date": "string | null",
      "end_date": "string | null",
      "is_current": "boolean",
      "description": "string | null",
      "achievements": ["string"],
      "technologies": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string (required)",
      "institution": "string (required)",
      "location": "string | null",
      "start_date": "string | null",
      "end_date": "string | null",
      "gpa": "string | null",
      "honors": "string | null",
      "coursework": ["string"]
    }
  ],
  "skills": ["string"],
  "skill_categories": [
    {
      "category": "string",
      "skills": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string (required)",
      "issuer": "string (required)",
      "issue_date": "string | null",
      "credential_id": "string | null"
    }
  ],
  "projects": [
    {
      "name": "string (required)",
      "description": "string (required)",
      "technologies": ["string"],
      "url": "url | null"
    }
  ],
  "languages": [
    {
      "language": "string (required)",
      "proficiency": "string (required)"
    }
  ],
  "awards": ["string"],
  "publications": ["string"],
  "volunteer": ["string"],
  "interests": ["string"]
}
```

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "detail": "Error message description"
}
```

### Common Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input (wrong file format, missing fields)
- `404 Not Found`: Resource not found (file, template)
- `500 Internal Server Error`: Processing error

### Example Error Handling

**Python:**
```python
response = requests.post(url, files=files, data=data)

if response.status_code == 200:
    result = response.json()
    print("Success!")
elif response.status_code == 400:
    error = response.json()
    print(f"Bad request: {error['detail']}")
elif response.status_code == 500:
    print("Server error, please try again")
```

**JavaScript:**
```javascript
try {
  const response = await fetch(url, { method: 'POST', body: formData });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  const result = await response.json();
  console.log('Success!', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔄 Rate Limiting (Recommended for Production)

Implement rate limiting to prevent abuse:

```python
# Example with FastAPI-limiter
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/api/v1/cv/process", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
```

Suggested limits:
- Extract: 20 requests/minute
- Process: 10 requests/minute
- Fill: 30 requests/minute

---

## 📝 Integration Examples

### Next.js Integration

```typescript
// lib/cvAgent.ts
export async function processCv(file: File, templateName: string = 'modern') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('template_name', templateName);
  formData.append('output_format', 'pdf');
  
  const response = await fetch('http://localhost:8000/api/v1/cv/process', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to process CV');
  }
  
  return response.json();
}

// Component
function CvUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const handleUpload = async () => {
    if (!file) return;
    
    setProcessing(true);
    try {
      const result = await processCv(file, 'modern');
      window.open(`http://localhost:8000${result.download_url}`, '_blank');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!file || processing}>
        {processing ? 'Processing...' : 'Upload & Process'}
      </button>
    </div>
  );
}
```

### Express.js Backend Integration

```javascript
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/process-cv', upload.single('cv'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    formData.append('template_name', req.body.template || 'modern');
    formData.append('output_format', 'pdf');
    
    const response = await axios.post(
      'http://localhost:8000/api/v1/cv/process',
      formData,
      { headers: formData.getHeaders() }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🧪 Testing the API

### Using Postman

1. Import the OpenAPI spec from `http://localhost:8000/openapi.json`
2. Create a new request
3. Set method to POST
4. Add file in Body → form-data
5. Send request

### Using curl

See examples above for each endpoint.

### Using Python requests

See Python examples above for each endpoint.

---

## 📚 Interactive Documentation

When the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly from your browser.

---

## 🎯 Best Practices

1. **File Validation**: Always validate file types before uploading
2. **Error Handling**: Implement proper error handling for all API calls
3. **Timeouts**: Set reasonable timeouts for long-running operations
4. **Retry Logic**: Implement exponential backoff for failed requests
5. **Caching**: Cache extracted CV data to avoid redundant API calls
6. **Security**: Validate and sanitize all user inputs
7. **Rate Limiting**: Implement client-side rate limiting

---

Need more help? Check the full documentation in `DOCUMENTATION.md`!
