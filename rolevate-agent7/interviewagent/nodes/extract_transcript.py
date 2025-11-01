from ..tools.graphql_tool import fetch_interview_transcripts
from typing import Dict, List


def extract_transcript_node(state: Dict) -> Dict:
    """Fetch and process interview transcript data"""
    interview_id = state.get("interview_id")
    if not interview_id:
        return state
    
    api_key = state.get("system_api_key")
    transcripts = fetch_interview_transcripts(interview_id, api_key)
    
    if transcripts:
        # Sort transcripts by order or timestamp
        sorted_transcripts = sorted(transcripts, key=lambda x: x.get('order', 0) or x.get('timestamp', ''))
        state["transcript_data"] = sorted_transcripts
        
        # Combine all transcript content into one text
        raw_transcript = []
        for transcript in sorted_transcripts:
            speaker = transcript.get('speaker', 'Unknown')
            content = transcript.get('content', '')
            timestamp = transcript.get('timestamp', '')
            raw_transcript.append(f"[{timestamp}] {speaker}: {content}")
        
        state["raw_transcript"] = "\n".join(raw_transcript)
        
        # Calculate some basic metrics
        total_words = sum(t.get('wordCount', 0) for t in transcripts)
        total_segments = len(transcripts)
        
        print(f"📝 Extracted transcript data:")
        print(f"   Segments: {total_segments}")
        print(f"   Total words: {total_words}")
        print(f"   Speakers: {len(set(t.get('speaker', 'Unknown') for t in transcripts))}")
        
    else:
        state["transcript_data"] = []
        state["raw_transcript"] = ""
        print(f"⚠️  No transcript data found for interview: {interview_id}")
    
    return state