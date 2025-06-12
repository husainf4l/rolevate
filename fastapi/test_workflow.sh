#!/usr/bin/env bash
# Test script for CV analysis workflow
# This script exercises the full workflow: create analysis, analyze CV, and send WhatsApp message.
# Prerequisites: Ensure the FastAPI server is running at http://localhost:8000 and "jq" is installed.

set -e
BASE_URL="http://localhost:8000"
CV_FILE="cv/1.pdf"

# 1. Create CV analysis
echo "\n==> Uploading CV for analysis..."
create_response=$(curl -s -X POST "$BASE_URL/api/cv/upload" \
  -F "candidate_phone=12345" \
  -F "job_id=app-6789" \
  -F "cv_file=@$CV_FILE")
echo "Response: $create_response"
analysis_id=$(echo "$create_response" | jq -r '.id')
echo "Extracted analysis_id: $analysis_id"

# 2. Trigger analysis
echo "\n==> Triggering CV analysis..."
analyze_response=$(curl -s -X POST "$BASE_URL/api/cv/analyze/$analysis_id")
echo "Analysis Result: $analyze_response"

# 3. Send WhatsApp message
echo "\n==> Sending WhatsApp message..."
whatsapp_response=$(curl -s -X POST "$BASE_URL/api/whatsapp/send/$analysis_id" \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+1234567890","template_name":"default","variables":{"name":"Test Candidate","score":"85"}}')
echo "WhatsApp Response: $whatsapp_response"

echo "\nWorkflow test completed successfully!"
