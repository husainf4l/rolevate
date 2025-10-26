#!/usr/bin/env python3
"""
Test script for GraphQL API with API Key authentication
Simulates requests from a mobile app or external service
"""

import requests
import json
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://192.168.1.164:4005/api/graphql"
API_KEY = "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"


def graphql_request(
    query: str,
    variables: Optional[Dict[str, Any]] = None,
    use_api_key: bool = True,
    jwt_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Make a GraphQL request
    
    Args:
        query: GraphQL query or mutation
        variables: Query variables
        use_api_key: Whether to use API key authentication
        jwt_token: JWT token for authentication (alternative to API key)
    
    Returns:
        Response data as dictionary
    """
    headers = {
        "Content-Type": "application/json"
    }
    
    if use_api_key:
        headers["x-api-key"] = API_KEY
        print(f"🔑 Using API Key: {API_KEY[:16]}...")
    elif jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
        print(f"🎫 Using JWT Token: {jwt_token[:16]}...")
    else:
        print("ℹ️  No authentication")
    
    payload = {
        "query": query
    }
    
    if variables:
        payload["variables"] = variables
    
    print(f"\n📤 Request:")
    print(f"   URL: {BASE_URL}")
    print(f"   Headers: {json.dumps(headers, indent=6)}")
    print(f"   Query: {query[:100]}...")
    
    try:
        response = requests.post(
            BASE_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"\n📥 Response:")
        print(f"   Status Code: {response.status_code}")
        
        result = response.json()
        print(f"   Body: {json.dumps(result, indent=6)}")
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        return {"error": str(e)}


def test_basic_query():
    """Test 1: Basic introspection query (no auth required)"""
    print("\n" + "="*60)
    print("📝 Test 1: Basic Query (No Auth Required)")
    print("="*60)
    
    query = """
    query {
        __typename
    }
    """
    
    result = graphql_request(query, use_api_key=False)
    
    if result.get("data"):
        print("\n✅ Test 1 PASSED")
    else:
        print("\n❌ Test 1 FAILED")
    
    return result


def test_get_applications():
    """Test 2: Get applications with API key"""
    print("\n" + "="*60)
    print("📝 Test 2: Get Applications (With API Key)")
    print("="*60)
    
    query = """
    query GetApplications {
        applications {
            id
            status
            createdAt
            candidate {
                id
                name
                email
            }
            job {
                id
                title
            }
        }
    }
    """
    
    result = graphql_request(query)
    
    if result.get("data") and "applications" in result["data"]:
        applications = result["data"]["applications"]
        print(f"\n✅ Test 2 PASSED - Found {len(applications)} applications")
        return applications
    else:
        print("\n❌ Test 2 FAILED")
        if result.get("errors"):
            for error in result["errors"]:
                print(f"   Error: {error.get('message')}")
        return None


def test_get_single_application(application_id: str):
    """Test 3: Get single application with API key"""
    print("\n" + "="*60)
    print(f"📝 Test 3: Get Single Application (ID: {application_id})")
    print("="*60)
    
    query = """
    query GetApplication($id: ID!) {
        application(id: $id) {
            id
            status
            createdAt
            coverLetter
            resumeUrl
            cvAnalysisScore
            candidate {
                id
                name
                email
                phone
            }
            job {
                id
                title
                company {
                    name
                }
            }
        }
    }
    """
    
    variables = {"id": application_id}
    
    result = graphql_request(query, variables=variables)
    
    if result.get("data") and result["data"].get("application"):
        print("\n✅ Test 3 PASSED")
        return result["data"]["application"]
    else:
        print("\n❌ Test 3 FAILED")
        if result.get("errors"):
            for error in result["errors"]:
                print(f"   Error: {error.get('message')}")
        return None


def test_get_jobs():
    """Test 4: Get jobs (public endpoint)"""
    print("\n" + "="*60)
    print("📝 Test 4: Get Jobs (Public - No Auth)")
    print("="*60)
    
    query = """
    query GetJobs {
        jobs {
            id
            title
            location
            workType
            experience
            company {
                name
                logo
            }
        }
    }
    """
    
    result = graphql_request(query, use_api_key=False)
    
    if result.get("data") and "jobs" in result["data"]:
        jobs = result["data"]["jobs"]
        print(f"\n✅ Test 4 PASSED - Found {len(jobs)} jobs")
        return jobs
    else:
        print("\n❌ Test 4 FAILED")
        return None


def test_wrong_header():
    """Test 5: Test with wrong header name (should fail)"""
    print("\n" + "="*60)
    print("📝 Test 5: Wrong Header Name (Should Fail)")
    print("="*60)
    
    query = """
    query {
        applications {
            id
        }
    }
    """
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY  # Wrong: should be lowercase 'x-api-key'
    }
    
    print(f"\n📤 Request with WRONG header:")
    print(f"   Using 'X-API-Key' instead of 'x-api-key'")
    
    try:
        response = requests.post(
            BASE_URL,
            headers=headers,
            json={"query": query},
            timeout=10
        )
        
        result = response.json()
        print(f"\n📥 Response: {json.dumps(result, indent=6)}")
        
        if result.get("errors"):
            print("\n✅ Test 5 PASSED - Request correctly failed with wrong header")
        else:
            print("\n❌ Test 5 FAILED - Request should have failed but didn't")
        
        return result
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return {"error": str(e)}


def main():
    """Run all tests"""
    print("\n" + "━"*60)
    print("🧪 GraphQL API Testing Suite")
    print("━"*60)
    print(f"\nBase URL: {BASE_URL}")
    print(f"API Key: {API_KEY[:16]}...{API_KEY[-8:]}")
    print("\n" + "━"*60)
    
    # Test 1: Basic query
    test_basic_query()
    
    # Test 2: Get applications
    applications = test_get_applications()
    
    # Test 3: Get single application (if we have any)
    if applications and len(applications) > 0:
        first_app_id = applications[0]["id"]
        test_get_single_application(first_app_id)
    else:
        print("\n⏭️  Skipping Test 3 - No applications found")
    
    # Test 4: Get jobs
    test_get_jobs()
    
    # Test 5: Wrong header
    test_wrong_header()
    
    # Summary
    print("\n" + "━"*60)
    print("✅ All tests complete!")
    print("━"*60)
    print("\n💡 Tips for mobile integration:")
    print("   1. Always use lowercase 'x-api-key' header")
    print("   2. No 'Bearer' prefix for API keys")
    print("   3. Check backend logs for detailed errors")
    print("   4. Some endpoints require JWT, not API keys")
    print("\n")


if __name__ == "__main__":
    main()
