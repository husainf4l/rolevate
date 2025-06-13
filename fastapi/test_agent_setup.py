#!/usr/bin/env python3
"""
Quick test of the job post agent imports and basic setup
"""

def test_imports():
    print("🧪 TESTING IMPORTS AND BASIC SETUP")
    print("=" * 50)
    
    try:
        from agent.job_post_agent import run_job_post_agent
        print("✅ Job post agent import successful")
        
        from openai import OpenAI
        print("✅ OpenAI import successful")
        
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and api_key.startswith("sk-"):
            print("✅ OpenAI API key found")
        else:
            print("❌ OpenAI API key missing or invalid")
            
        print("\n🎯 Agent setup looks good!")
        print("💡 You can now run the interactive console:")
        print("   python interactive_job_console.py")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_imports()
