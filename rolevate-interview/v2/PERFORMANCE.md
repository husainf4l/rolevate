# Performance Optimization Guide

## Current Bottlenecks Identified

From your logs, the main performance issues are:

1. **False Interruption Detection** - Causing 2-second delays
2. **Verbose Debug Logging** - Slowing down I/O
3. **VAD Warnings** - Segment synchronization issues
4. **HTTP Session Recreation** - Unnecessary connection overhead
5. **No Streaming Optimization** - Waiting for complete responses

## Applied Optimizations

### 1. Reduced Verbose Logging
**File**: `utils/logging_config.py`

Suppressed noisy loggers:
- LiveKit DEBUG logs → INFO/WARNING
- OpenAI HTTP logs → WARNING
- HTTPCore/HTTPX logs → WARNING

```python
logging.getLogger('livekit').setLevel(logging.WARNING)
logging.getLogger('livekit.agents').setLevel(logging.INFO)
logging.getLogger('openai').setLevel(logging.WARNING)
```

### 2. Optimized Interruption Detection
**File**: `config.py`

Added configurable parameters:
- `MIN_ENDPOINTING_DELAY=0.5` - Minimum pause before speech end (faster response)
- `INTERRUPTION_THRESHOLD=0.8` - Sensitivity to interruptions
- `ENABLE_INTERRUPTIONS=true` - Toggle interruption support

**File**: `agent.py`

Applied settings to RoomInputOptions:
```python
room_input = RoomInputOptions(
    min_endpointing_delay=settings.min_endpointing_delay,
)
```

### 3. Streaming Optimizations
**File**: `orchestrator.py`

Enhanced agent session configuration:
```python
llm=openai.LLM(
    model="gpt-4o-mini",
    temperature=0.7,
    max_tokens=500  # Faster responses with token limit
)

tts=elevenlabs.TTS(
    voice_id="u0TsaWvt0v8migutHM3M",
    streaming=True  # Enable audio streaming
)

stt=soniox.STT(
    params=soniox.STTOptions(
        language_hints=["ar", "en"],
        enable_dictation=True,
        enable_endpoint_detection=True  # Faster speech recognition
    )
)
```

### 4. HTTP Connection Pooling
**File**: `config.py`

Reduced default timeouts and connection limits:
```python
HTTP_TIMEOUT=15  # Down from 30
HTTP_MAX_CONNECTIONS=50  # Down from 100
MAX_RETRIES=2  # Down from 3
```

## Performance Tuning Parameters

### For Faster Response Times:
```bash
# .env settings
MIN_ENDPOINTING_DELAY=0.3  # Aggressive (more interruptions)
MAX_TOKENS=300  # Shorter responses
LOG_LEVEL=WARNING  # Minimal logging
```

### For Fewer False Interruptions:
```bash
# .env settings
MIN_ENDPOINTING_DELAY=0.8  # Conservative (fewer interruptions)
INTERRUPTION_THRESHOLD=0.9  # Less sensitive
```

### For Production:
```bash
# .env settings
LOG_LEVEL=WARNING
HTTP_TIMEOUT=15
MAX_RETRIES=2
MIN_ENDPOINTING_DELAY=0.5
ENABLE_INTERRUPTIONS=true
```

## Monitoring Performance

### Key Metrics to Track:

1. **Time to First Audio** - After user stops speaking
2. **Transcription Delay** - STT processing time
3. **LLM Response Time** - API call duration
4. **TTS Generation Time** - Text-to-speech latency
5. **False Interruption Rate** - Unnecessary speech stops

### Log Analysis:

Search for these patterns in logs:
```bash
# Find false interruptions
grep "resumed false interrupted speech" logs.txt

# Find slow LLM responses
grep "openai-processing-ms" logs.txt

# Find VAD warnings
grep "_SegmentSynchronizerImpl" logs.txt
```

## Advanced Optimizations

### 1. Enable VAD Streaming
Modify `orchestrator.py` to use streaming VAD:
```python
vad=silero.VAD.load(
    min_speech_duration=0.25,  # Faster detection
    min_silence_duration=0.5,   # Quicker endpoint
)
```

### 2. Reduce Token Usage
Modify system instructions in `orchestrator.py` to be more concise.

### 3. Pre-warm Connections
Initialize HTTP sessions during setup phase instead of on-demand.

### 4. Parallel Processing
Process transcripts asynchronously without blocking main flow.

## Troubleshooting

### Issue: "resumed false interrupted speech"
**Cause**: VAD detecting speech when there isn't any
**Fix**: Increase `MIN_ENDPOINTING_DELAY` to 0.6-0.8

### Issue: "_SegmentSynchronizerImpl.resume called after close"
**Cause**: Session state mismatch
**Fix**: Ensure proper session lifecycle management (already implemented)

### Issue: Slow HTTP sessions
**Cause**: Connection pool exhaustion
**Fix**: Reduce `HTTP_MAX_CONNECTIONS` or increase timeout

## Benchmark Results

### Before Optimization:
- Average response time: 3-5 seconds
- False interruptions: ~2 per minute
- Log volume: 500+ lines/minute

### After Optimization:
- Average response time: 1-2 seconds (expected)
- False interruptions: <1 per minute (expected)
- Log volume: 50-100 lines/minute (expected)

## Quick Start

1. **Copy performance settings**:
   ```bash
   cat .env.performance >> .env
   ```

2. **Restart agent**:
   ```bash
   source .venv/bin/activate
   python agent.py dev
   ```

3. **Monitor logs** for improvements:
   ```bash
   # Count false interruptions
   grep -c "resumed false interrupted speech" logs.txt
   ```

## Further Reading

- [LiveKit Agent Performance](https://docs.livekit.io/agents/performance/)
- [OpenAI Streaming](https://platform.openai.com/docs/api-reference/streaming)
- [ElevenLabs Latency](https://elevenlabs.io/docs/api-reference/streaming)
