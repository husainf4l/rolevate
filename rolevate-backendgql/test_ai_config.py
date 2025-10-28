#!/usr/bin/env python3
"""
Test script for GraphQL API with API Key authentication
"""

import requests
import json
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://127.0.0.1:4005/api/graphql"
API_KEY = "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"

def graphql_request(query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    response = requests.post(BASE_URL, headers=headers, json=payload, timeout=30)
    return response.json()

def test_generate_ai_config():
    """Test AI configuration generation"""
    print("🧪 Testing AI Configuration Generation...")

    query = """
    mutation GenerateAIConfig($input: AIConfigInput!) {
        generateAIConfiguration(input: $input) {
            aiCvAnalysisPrompt
            aiFirstInterviewPrompt
            aiSecondInterviewPrompt
        }
    }
    """

    variables = {
        "input": {
            "jobTitle": "Software Engineer",
            "department": "Engineering",
            "industry": "Technology",
            "jobLevel": "Mid",
            "description": "Develop and maintain web applications",
            "responsibilities": "Write clean code, collaborate with team",
            "requirements": "3+ years experience, React, Node.js",
            "skills": ["JavaScript", "React", "Node.js"],
            "interviewLanguage": "english",
            "interviewQuestions": "Tell me about yourself, Why do you want this job?"
        }
    }

    result = graphql_request(query, variables)

    if result.get("data") and result["data"].get("generateAIConfiguration"):
        print("✅ AI Configuration Generated Successfully!")
        config = result["data"]["generateAIConfiguration"]
        print(f"   CV Analysis Prompt: {len(config['aiCvAnalysisPrompt'])} characters")
        print(f"   Interview Prompt: {len(config['aiFirstInterviewPrompt'])} characters")
        return True
    else:
        print("❌ AI Configuration Failed")
        if result.get("errors"):
            for error in result["errors"]:
                print(f"   Error: {error.get('message')}")
        return False

if __name__ == "__main__":
    success = test_generate_ai_config()
    if success:
        print("\n🎉 All tests passed! AI features are working correctly.")
    else:
        print("\n❌ Tests failed. Check the API key and OpenAI service.")