import os
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

async def test_tts():
    api_key = os.getenv("ELEVEN_API_KEY")
    if not api_key:
        print("No API key")
        return

    voice_id = "EkK5I93UQWFDigLMpZcX"  # James

    async with aiohttp.ClientSession() as session:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        data = {
            "text": "Hello, this is a test.",
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }

        async with session.post(url, json=data, headers=headers) as resp:
            print(f"Status: {resp.status}")
            if resp.status == 200:
                print("TTS successful")
            else:
                print(f"Error: {await resp.text()}")

asyncio.run(test_tts())
