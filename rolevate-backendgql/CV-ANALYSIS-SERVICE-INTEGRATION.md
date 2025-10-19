# CV Analysis Service Integration Guide

## Overview
The CV analysis functionality has been **decoupled** from the NestJS application and is now handled by a **FastAPI microservice** using **LangGraph** for stateful workflow management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  NestJS GraphQL API (Port 4005)              │
│                                                              │
│  1. Application Created                                      │
│  2. HTTP POST → FastAPI Service                              │
│  3. Return 202 Accepted                                      │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           FastAPI CV Analysis Service (Port 8000)            │
│                                                              │
│  LangGraph Workflow:                                         │
│  ├─ Node 1: Download CV from S3                             │
│  ├─ Node 2: Extract Text (PDF/OCR)                          │
│  ├─ Node 3: Parse Candidate Info                            │
│  ├─ Node 4: Analyze CV vs Job                               │
│  ├─ Node 5: Generate Recommendations                        │
│  └─ Node 6: POST Results Back (GraphQL Mutation)            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         GraphQL Mutation: updateApplicationAnalysis          │
│         (Authenticated with SYSTEM_API_KEY)                  │
└─────────────────────────────────────────────────────────────┘
```

## What Was Removed from NestJS

### ❌ Removed Services
- `OpenaiCvAnalysisService.analyzeCVWithOpenAI()` - Full CV analysis logic
- `OpenaiCvAnalysisService.generateRecommendations()` - AI recommendations
- `ApplicationService.analyzeCVInBackground()` - Background async processing
- All text extraction methods from `openai-cv-analysis.service.ts`

### ✅ What Remains
- `CvParsingService.extractCandidateInfoFromCV()` - Still used for anonymous applications
- `ApplicationService.triggerCVAnalysis()` - New method to call FastAPI
- `ApplicationService.updateApplicationAnalysis()` - Receives results from FastAPI

## Environment Variables

Add to `.env`:

```bash
# CV Analysis Service (FastAPI)
CV_ANALYSIS_API_URL=http://localhost:8000
GRAPHQL_API_URL=http://localhost:4005/api/graphql
SYSTEM_API_KEY=your-system-api-key-here
```

## FastAPI Service Expected Payload

### POST `/cv-analysis`

**Request:**
```json
{
  "application_id": "uuid",
  "candidateid": "uuid",
  "jobid": "uuid",
  "cv_link": "https://bucket.s3.amazonaws.com/cvs/...",
  "callbackUrl": "http://localhost:4005/api/graphql",
  "systemApiKey": "your-system-api-key"
}
```

**Note:** The FastAPI agent will fetch the full job details using `jobId` from your database. This keeps the payload lightweight and ensures the agent always has fresh job data.

**Response (Optional):**
```json
{
  "status": "accepted",
  "message": "CV analysis started"
}
```

**Note:** NestJS uses fire-and-forget pattern and doesn't wait for or check the response. The agent will independently analyze and post results back via callback.
*Status Code: 202 Accepted*

## FastAPI Callback Mutation

When analysis completes, FastAPI calls this GraphQL mutation:

```graphql
mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
  updateApplicationAnalysis(input: $input) {
    id
    cvAnalysisScore
    cvAnalysisResults
    analyzedAt
    aiCvRecommendations
    aiInterviewRecommendations
  }
}
```

**Variables:**
```json
{
  "input": {
    "applicationId": "uuid",
    "cvAnalysisScore": 85,
    "cvAnalysisResults": "{\"score\": 85, \"summary\": \"...\", \"strengths\": [...], ...}",
    "aiCvRecommendations": "1. Highlight sales achievements...",
    "aiInterviewRecommendations": "1. Prepare STAR stories..."
  }
}
```

**Headers:**
```
Content-Type: application/json
x-api-key: your-system-api-key
```

## Benefits of This Architecture

### 🚀 Performance
- Non-blocking: Main app doesn't wait for slow AI processing
- Horizontal scaling: Scale CV service independently
- Better resource allocation

### 🔧 Maintainability
- Clear separation of concerns
- Easier to test and debug
- Independent deployment cycles

### 📊 Observability
- LangGraph state tracking
- Retry logic per node
- Progress monitoring

### 🔒 Security
- API key isolation
- Separate rate limiting
- Credential management

## Testing the Integration

### 1. Start NestJS Server
```bash
npm run start:dev
```

### 2. Create an Application
```graphql
mutation CreateApplication {
  createApplication(input: {
    jobId: "uuid"
    resumeUrl: "s3://..."
    email: "test@example.com"
    firstName: "Test"
    lastName: "Candidate"
  }) {
    application {
      id
      cvAnalysisScore
    }
    message
  }
}
```

### 3. Check Logs
You should see:
```
🚀 Triggering CV analysis for application: uuid
✅ CV analysis request accepted by FastAPI service
```

### 4. FastAPI Processes
The FastAPI service will:
1. Download CV from S3
2. Extract text
3. Analyze with GPT-4
4. Generate recommendations
5. POST results back

### 5. Verify Results
Query the application:
```graphql
query GetApplication($id: ID!) {
  application(id: $id) {
    id
    cvAnalysisScore
    cvAnalysisResults
    analyzedAt
    aiCvRecommendations
  }
}
```

## Next Steps for FastAPI Development

### 1. Project Structure
```
cv-analysis-service/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── models.py               # Pydantic models
│   ├── workflows/
│   │   └── cv_analysis.py      # LangGraph workflow
│   ├── nodes/
│   │   ├── download_cv.py      # Node 1
│   │   ├── extract_text.py     # Node 2
│   │   ├── parse_candidate.py  # Node 3
│   │   ├── analyze_cv.py       # Node 4
│   │   ├── generate_recs.py    # Node 5
│   │   └── post_results.py     # Node 6
│   └── services/
│       ├── s3_service.py       # AWS S3 client
│       ├── openai_service.py   # OpenAI client
│       └── graphql_service.py  # GraphQL client
├── requirements.txt
└── .env
```

### 2. Key Dependencies
```txt
fastapi==0.109.0
langgraph==0.0.20
langchain==0.1.0
openai==1.10.0
boto3==1.34.0
pdf-parse==1.2.0
tesseract==0.1.3
httpx==0.26.0
pydantic==2.5.0
```

### 3. Example LangGraph Workflow
```python
from langgraph.graph import StateGraph

# Define workflow state
class CVAnalysisState(TypedDict):
    application_id: str
    cv_url: str
    job_data: dict
    cv_text: Optional[str]
    candidate_info: Optional[dict]
    analysis_results: Optional[dict]
    recommendations: Optional[dict]
    
# Create workflow
workflow = StateGraph(CVAnalysisState)

# Add nodes
workflow.add_node("download_cv", download_cv_node)
workflow.add_node("extract_text", extract_text_node)
workflow.add_node("parse_candidate", parse_candidate_node)
workflow.add_node("analyze_cv", analyze_cv_node)
workflow.add_node("generate_recs", generate_recommendations_node)
workflow.add_node("post_results", post_results_node)

# Define edges
workflow.set_entry_point("download_cv")
workflow.add_edge("download_cv", "extract_text")
workflow.add_edge("extract_text", "parse_candidate")
workflow.add_edge("parse_candidate", "analyze_cv")
workflow.add_edge("analyze_cv", "generate_recs")
workflow.add_edge("generate_recs", "post_results")

# Compile
app = workflow.compile()
```

## Troubleshooting

### CV Analysis Not Triggered
- Check `CV_ANALYSIS_API_URL` in `.env`
- Verify FastAPI service is running
- Check network connectivity

### Results Not Posted Back
- Verify `SYSTEM_API_KEY` matches on both services
- Check `GRAPHQL_API_URL` is accessible from FastAPI
- Review GraphQL mutation logs

### Analysis Fails
- Check OpenAI API key in FastAPI
- Verify S3 access permissions
- Review LangGraph state persistence

## Migration Checklist

- [x] Remove `analyzeCVInBackground` logic
- [x] Add `triggerCVAnalysis` method
- [x] Add `updateApplicationAnalysis` method
- [x] Create GraphQL mutation
- [x] Add environment variables
- [ ] Build FastAPI service with LangGraph
- [ ] Test end-to-end flow
- [ ] Deploy FastAPI service
- [ ] Update production environment variables
- [ ] Monitor logs and performance

## Support

For issues or questions:
- FastAPI Service: Check FastAPI logs
- NestJS Service: Check `npm run start:dev` logs
- Integration: Review both service logs

---

**Ready to build the FastAPI service!** 🚀
