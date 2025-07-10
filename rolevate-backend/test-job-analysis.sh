#!/bin/bash

# Test job analysis endpoint with short description
echo "Testing job analysis endpoint..."

curl -X POST http://localhost:4005/api/aiautocomplete/job-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobTitle": "Sales Representative",
    "department": "Sales",
    "industry": "healthcare",
    "employeeType": "FULL_TIME",
    "jobLevel": "MID",
    "workType": "ONSITE",
    "location": "Amman",
    "country": "Jordan"
  }' | jq '.jobRequirements.shortDescription'

echo "Job analysis test completed."
