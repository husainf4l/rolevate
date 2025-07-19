
import os
from dotenv import load_dotenv
from livekit.plugins import elevenlabs
from livekit.agents import tts

load_dotenv()

ELEVEN_API_KEY = os.environ.get("ELEVEN_API_KEY")

class CustomTTS:
    def __init__(self):
        self._tts = elevenlabs.TTS(api_key=ELEVEN_API_KEY)
        self.capabilities = self._tts.capabilities

    def synthesize(self, text: str):
        return self._tts.synthesize(text)

    def stream(self, **kwargs):
        return self._tts.stream(**kwargs)
