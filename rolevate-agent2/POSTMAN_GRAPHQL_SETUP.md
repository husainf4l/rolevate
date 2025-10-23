# GraphQL API Key Setup in Postman

## Step 1: Create New Request
1. Open Postman
2. Click 'New' → 'HTTP Request'

## Step 2: Set Request Method and URL
- Method: POST
- URL: `http://localhost:4005/api/graphql`

## Step 3: Add API Key Header
1. Go to 'Headers' tab
2. Add new header:
   - **Key:** `x-api-key`
   - **Value:** `31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e`

## Step 4: Set Content-Type
Add another header:
   - **Key:** `Content-Type`
   - **Value:** `application/json`

## Step 5: Add GraphQL Query in Body
1. Go to 'Body' tab
2. Select 'raw'
3. Choose 'JSON' from dropdown
4. Paste your GraphQL query

## Example Queries

### Simple Query (Get Jobs)
```json
{
  "query": "query GetJobs { jobs { id title description } }",
  "variables": {}
}
```

### CV Analysis Mutation
```json
{
  "query": "mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) { updateApplicationAnalysis(input: $input) { id status cvAnalysisScore } }",
  "variables": {
    "input": {
      "applicationId": "your-app-id",
      "cvAnalysisScore": 85,
      "candidateInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "experience": [
          {
            "company": "Google",
            "position": "Software Engineer",
            "startDate": "2020-01",
            "isCurrent": true
          }
        ],
        "education": [
          {
            "institution": "MIT",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "endDate": "2022-06"
          }
        ]
      }
    }
  }
}
```

### Get Application Details
```json
{
  "query": "query GetApplication($id: ID!) { application(id: $id) { id coverLetter status } }",
  "variables": {
    "id": "your-application-id"
  }
}
```

## Step 6: Send Request
Click the 'Send' button to execute the request.

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check that the `x-api-key` header is exactly `x-api-key` (not `X-API-Key` or `api-key`)
   - Verify the API key value matches your `.env` file

2. **400 Bad Request**
   - Ensure Content-Type is `application/json`
   - Check JSON syntax in the body

3. **Connection Refused**
   - Make sure your NestJS server is running on `http://localhost:4005`

### Headers Summary:
```
x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e
Content-Type: application/json
```

## Pro Tips

1. **Save as Collection:** Create a Postman collection for your GraphQL requests
2. **Environment Variables:** Store the API key in Postman environment variables
3. **GraphQL Plugin:** Consider using Postman's GraphQL request type for better query formatting
4. **Tests:** Add tests to validate response status and data structure

## Alternative: Using curl

If you prefer command line:

```bash
curl -X POST http://localhost:4005/api/graphql \
  -H "x-api-key: 31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e" \
  -H "Content-Type: application/json" \
  -d '{"query": "query GetJobs { jobs { id title } }"}'
```