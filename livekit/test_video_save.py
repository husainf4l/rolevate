#!/usr/bin/env python3
"""
Test script for video saving functionality
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add agent10 to path
sys.path.append(os.path.join(os.path.dirname(__file__), "agent10"))

# Load environment variables
load_dotenv()

# Import the save function from main.py
from agent10.main import save_video_to_backend


async def test_video_save():
    """Test the video saving function with sample data"""

    print("🧪 Testing video save functionality...")
    print(f"Backend URL: {os.getenv('BACKEND_URL', 'NOT SET')}")

    # Test data with the interview_ prefixed room ID format
    test_room_id = "interview_cmd9hrag1001c3ssw6k20uuh1_1753217764155"
    test_video_url = "https://4wk-garage-media.s3.me-central-1.amazonaws.com/recordings/interview_cmd9hrag1001c3ssw6k20uuh1_1753217764155_job_456.mp4"
    test_metadata = {
        "jobId": "test_job_456",
        "candidateId": "test_candidate_789",
        "companyId": "test_company_101",
    }

    print(f"Room ID: {test_room_id}")
    print(f"Video URL: {test_video_url}")
    print(f"Metadata: {test_metadata}")
    print("-" * 50)

    try:
        # Call the save function
        result = await save_video_to_backend(
            test_room_id, test_video_url, test_metadata
        )

        if result:
            print("✅ SUCCESS: Video URL saved successfully!")
        else:
            print("❌ FAILED: Video URL was not saved")

    except Exception as e:
        print(f"❌ ERROR: {e}")


if __name__ == "__main__":
    asyncio.run(test_video_save())
