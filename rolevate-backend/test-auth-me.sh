#!/bin/bash

echo "🚀 Testing /auth/me endpoint with curl..."

# First login to get access token
echo "📝 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Access token obtained (first 20 chars): ${ACCESS_TOKEN:0:20}..."

# Test /auth/me endpoint
echo "🔍 Testing /auth/me..."
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "📋 /auth/me response:"
echo $ME_RESPONSE | jq . 2>/dev/null || echo $ME_RESPONSE
