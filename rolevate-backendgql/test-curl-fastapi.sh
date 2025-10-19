# Test FastAPI CV Analysis with Real Data

## Curl Command

```bash
curl -X POST http://localhost:8000/cv-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "4e31ad4c-7e5e-4e6f-a028-244170a7892c",
    "candidateid": "ea55df49-a950-459d-b7cd-f64a7ffd397f",
    "jobid": "3d0e9b53-5e4d-4001-ad4d-52f92e158603",
    "cv_link": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/1e604193-8a7d-454d-89af-6a7bf115cb60-AlHussein_Resume_21.pdf",
    "callbackUrl": "http://localhost:4005/api/graphql",
    "systemApiKey": "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"
  }'
```

## Expected Response

```json
{
  "cv_link": "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/1e604193-8a7d-454d-89af-6a7bf115cb60-AlHussein_Resume_21.pdf",
  "jobid": "3d0e9b53-5e4d-4001-ad4d-52f92e158603",
  "application_id": "4e31ad4c-7e5e-4e6f-a028-244170a7892c",
  "candidateid": "ea55df49-a950-459d-b7cd-f64a7ffd397f",
  "analysis": "CV analysis completed for candidate ea55df49-a950-459d-b7cd-f64a7ffd397f applying for job 3d0e9b53-5e4d-4001-ad4d-52f92e158603 | Matched skills: Python, FastAPI, Machine Learning"
}
```

## Run the Test

```bash
# Copy and paste the curl command above into your terminal
# Make sure your FastAPI service is running on port 8000
```

## Alternative: One-liner format

```bash
curl -X POST http://localhost:8000/cv-analysis -H "Content-Type: application/json" -d '{"application_id":"4e31ad4c-7e5e-4e6f-a028-244170a7892c","candidateid":"ea55df49-a950-459d-b7cd-f64a7ffd397f","jobid":"3d0e9b53-5e4d-4001-ad4d-52f92e158603","cv_link":"https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/1e604193-8a7d-454d-89af-6a7bf115cb60-AlHussein_Resume_21.pdf","callbackUrl":"http://localhost:4005/api/graphql","systemApiKey":"31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"}'
```