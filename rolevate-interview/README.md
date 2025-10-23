# Rolevate Interview Agent

AI-powered interview agent for conducting multi-stage interviews with personality analysis.

## Features

- 🎙️ **Voice-based interviews** in Arabic and English
- 🎯 **Multi-stage flow**: Introduction → Technical → Behavioral → Summary
- 🧠 **Personality analysis** and candidate assessment
- 👁️ **Vision capabilities** for code/design review
- 🔌 **Backend integration** for data management
- 🌍 **Multilingual support** (Arabic & English)

## Project Structure

```
rolevate-interview/
├── agent.py                    # Main agent entry point
├── tools/                      # Agent tools and utilities
│   ├── backend_api.py         # Backend API integration
│   ├── personality_analysis.py # Personality assessment tools
│   └── vision_tools.py        # Vision and multimodal capabilities
├── prompts/                    # Interview stage prompts
│   ├── introduction.py        # Introduction stage
│   ├── technical.py           # Technical interview
│   ├── behavioral.py          # Behavioral assessment
│   └── summary.py             # Summary and closing
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ASSEMBLYAI_API_KEY=
```

3. Run the agent:
```bash
python agent.py dev
```

## Based on LiveKit Examples

This project is built using best practices from:
- `multi_stage_flow.py` - Multi-stage interview structure
- `vision_agent.py` - Vision capabilities for code/portfolio review
- `structured_outputs.py` - Personality analysis and scoring

## TODO

- [ ] Implement agent classes for each interview stage
- [ ] Add backend API integration
- [ ] Implement personality analysis algorithms
- [ ] Add vision tools for code/design review
- [ ] Configure Arabic TTS voices
- [ ] Add comprehensive testing
- [ ] Deploy to production
