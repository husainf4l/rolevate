import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GRAPHQL_ENDPOINT = os.getenv("GRAPHQL_ENDPOINT")
API_KEY = os.getenv("ROLEVATE_API_KEY")

def get_application_data(application_id: str):
    """
    Fetches application data from the GraphQL API.

    Args:
        application_id (str): The ID of the application to fetch.

    Returns:
        dict: The application data if successful, None if failed.
    """
    if not GRAPHQL_ENDPOINT or not API_KEY:
        raise ValueError("GRAPHQL_ENDPOINT or ROLEVATE_API_KEY not set in environment variables")

    query = f"""
    query Application {{
        application(id: "{application_id}") {{
            candidate {{
                id
                name
            }}
            cvAnalysisResults
            job {{
                id
                title
                salary
                company {{
                    name
                    description
                    phone
                    email
                }}
                interviewPrompt
                description
                interviewLanguage
            }}
        }}
    }}
    """

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    payload = {
        "query": query.strip()
    }

    try:
        response = requests.post(GRAPHQL_ENDPOINT, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}")
            return None
        return data.get("data", {}).get("application")
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return None