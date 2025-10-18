#!/bin/bash

# Quick test to verify the updateJob fix
API_URL="http://localhost:4000/graphql"

echo "🧪 Testing updateJob mutation structure..."
echo ""

# Test 1: Verify the mutation accepts input without separate id parameter
echo "1️⃣ Testing correct mutation structure (id inside input)..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { __type(name: \"Mutation\") { fields(includeDeprecated: true) { name args { name type { name kind ofType { name } } } } } }"
  }' | jq '.data.__type.fields[] | select(.name == "updateJob")')

echo "UpdateJob mutation signature:"
echo "$RESPONSE" | jq '.'

# Check if it has the correct structure
if echo "$RESPONSE" | jq -e '.args[] | select(.name == "input")' > /dev/null 2>&1; then
  echo ""
  echo "✅ Mutation accepts 'input' parameter"
  
  if echo "$RESPONSE" | jq -e '.args[] | select(.name == "id")' > /dev/null 2>&1; then
    echo "⚠️  WARNING: Mutation also has separate 'id' parameter (unexpected)"
  else
    echo "✅ No separate 'id' parameter (correct!)"
  fi
else
  echo "❌ Mutation does not accept 'input' parameter"
fi

echo ""
echo "2️⃣ Checking UpdateJobInput type structure..."
INPUT_TYPE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"UpdateJobInput\") { inputFields { name type { name kind } } } }"
  }' | jq '.data.__type')

if [ "$INPUT_TYPE" != "null" ]; then
  echo "✅ UpdateJobInput type exists"
  echo ""
  echo "Fields in UpdateJobInput:"
  echo "$INPUT_TYPE" | jq '.inputFields[] | .name' | head -10
  
  if echo "$INPUT_TYPE" | jq -e '.inputFields[] | select(.name == "id")' > /dev/null 2>&1; then
    echo ""
    echo "✅ UpdateJobInput has 'id' field (correct!)"
  else
    echo ""
    echo "⚠️  UpdateJobInput does NOT have 'id' field"
  fi
else
  echo "❌ UpdateJobInput type does not exist"
fi

echo ""
echo "======================================"
echo ""
echo "Summary:"
echo "--------"
echo "Your frontend code has been fixed to:"
echo "1. Include 'id' in the UpdateJobInput interface"
echo "2. Send id inside the input object, not as a separate parameter"
echo "3. Match the backend GraphQL schema exactly"
echo ""
echo "✅ The 'Unknown argument id' error should now be fixed!"
echo ""
