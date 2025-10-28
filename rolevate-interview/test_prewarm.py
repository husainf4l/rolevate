#!/usr/bin/env python3

import sys
sys.path.insert(0, '/home/husain/rolevate/rolevate-interview/v1')

from livekit.plugins import silero
from .core.config import settings

try:
    print("Loading VAD...")
    vad = silero.VAD.load()
    print("VAD loaded successfully")
    settings.validate()
    print("Settings validated")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()