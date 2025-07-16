#!/bin/bash

# Quick test script for Papaya Trading WhatsApp Communication
# Usage: ./test-whatsapp-quick.sh YOUR_JWT_TOKEN

if [ -z "$1" ]; then
    echo "❌ Please provide your JWT token as an argument"
    echo "Usage: ./test-whatsapp-quick.sh YOUR_JWT_TOKEN"
    echo ""
    echo "To get your JWT token:"
    echo "1. Login to your app"
    echo "2. Open browser dev tools (F12)"
    echo "3. Go to Application > Cookies"
    echo "4. Copy the 'access_token' value"
    exit 1
fi

TOKEN=$1
BASE_URL="http://localhost:4005"
CANDIDATE_ID="cmcyx6dvw00003s3t4jmo91qx"

echo "🚀 Testing Papaya Trading WhatsApp Communication..."
echo "Candidate: d d (Phone: 962796026659)"
echo ""

# Test 1: Get communication stats
echo "1. Testing communication stats..."
curl -s -X GET "${BASE_URL}/api/communications/stats" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.' || echo "Raw response"

echo -e "\n"

# Test 2: Send WhatsApp message
echo "2. Sending WhatsApp message..."
curl -s -X POST "${BASE_URL}/api/communications/send-whatsapp" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "'${CANDIDATE_ID}'",
    "content": "Hello from Papaya Trading! 🌟 Thank you for your interest in our job opportunities. We have received your application and will review it shortly. We will be in touch soon!"
  }' | jq '.' || echo "Raw response"

echo -e "\n"

# Test 3: Get communication history for this candidate
echo "3. Getting communication history..."
curl -s -X GET "${BASE_URL}/api/communications/history/${CANDIDATE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.' || echo "Raw response"

echo -e "\n✅ Test completed!"
