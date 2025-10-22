#!/usr/bin/env python3
"""
Test GPT-5 Response Script
Simple test to check if GPT-5 is working with your API key
"""

import os
import asyncio
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


def test_gpt5_sync():
    """Test GPT-5 with synchronous API call"""
    print("🧪 Testing GPT-5 with synchronous API...")

    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment variables")
        return False

    # Create OpenAI client
    client = openai.OpenAI(api_key=api_key)

    try:
        # Test with a simple prompt
        response = client.chat.completions.create(
            model="gpt-5",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Respond briefly.",
                },
                {
                    "role": "user",
                    "content": "Hello! Can you confirm you are GPT-5 and tell me one interesting fact?",
                },
            ],
            max_completion_tokens=100,  # GPT-5 uses max_completion_tokens and default temperature
        )

        print("✅ GPT-5 Response:")
        print(f"Model: {response.model}")
        print(f"Content: {response.choices[0].message.content}")
        print(f"Usage: {response.usage}")
        return True

    except openai.APIError as e:
        print(f"❌ OpenAI API Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


async def test_gpt5_async():
    """Test GPT-5 with asynchronous API call"""
    print("\n🧪 Testing GPT-5 with asynchronous API...")

    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment variables")
        return False

    # Create async OpenAI client
    client = openai.AsyncOpenAI(api_key=api_key)

    try:
        # Test with a simple prompt
        response = await client.chat.completions.create(
            model="gpt-5",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Respond briefly.",
                },
                {
                    "role": "user",
                    "content": "What's the current date and can you tell me something about GPT-5?",
                },
            ],
            max_completion_tokens=150,  # GPT-5 uses max_completion_tokens instead of max_tokens
            temperature=0.7,
        )

        print("✅ GPT-5 Async Response:")
        print(f"Model: {response.model}")
        print(f"Content: {response.choices[0].message.content}")
        print(f"Usage: {response.usage}")
        return True

    except openai.APIError as e:
        print(f"❌ OpenAI API Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        await client.close()


async def test_gpt5_streaming():
    """Test GPT-5 with streaming API call"""
    print("\n🧪 Testing GPT-5 with streaming API...")

    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment variables")
        return False

    # Create async OpenAI client
    client = openai.AsyncOpenAI(api_key=api_key)

    try:
        # Test with streaming
        stream = await client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": "Count from 1 to 5 and explain what GPT-5 can do.",
                },
            ],
            max_completion_tokens=200,  # GPT-5 uses max_completion_tokens instead of max_tokens
            temperature=0.7,
            stream=True,
        )

        print("✅ GPT-5 Streaming Response:")
        full_response = ""
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                print(content, end="", flush=True)
                full_response += content

        print(f"\n\nFull response length: {len(full_response)} characters")
        return True

    except openai.APIError as e:
        print(f"❌ OpenAI API Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        await client.close()


def test_fallback_models():
    """Test fallback models if GPT-5 doesn't work"""
    print("\n🧪 Testing fallback models...")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment variables")
        return

    client = openai.OpenAI(api_key=api_key)
    fallback_models = ["gpt-4o", "gpt-4-turbo", "gpt-4"]

    for model in fallback_models:
        try:
            print(f"Testing {model}...")
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": f"Hello from {model}! Just say hi back.",
                    }
                ],
                max_tokens=50,  # Keep max_tokens for older models
            )
            print(f"✅ {model} works: {response.choices[0].message.content.strip()}")
            return model
        except Exception as e:
            print(f"❌ {model} failed: {e}")

    return None


async def main():
    """Main test function"""
    print("🚀 GPT-5 Test Suite")
    print("=" * 50)

    # Test 1: Synchronous call
    sync_success = test_gpt5_sync()

    # Test 2: Asynchronous call
    async_success = await test_gpt5_async()

    # Test 3: Streaming call (this is where the agent was failing)
    streaming_success = await test_gpt5_streaming()

    # Test 4: Fallback models if needed
    if not (sync_success or async_success or streaming_success):
        print("\n🔄 GPT-5 not working, testing fallback models...")
        working_model = test_fallback_models()
        if working_model:
            print(
                f"\n💡 Suggestion: Use '{working_model}' as a fallback model in your agent"
            )

    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"GPT-5 Sync: {'✅' if sync_success else '❌'}")
    print(f"GPT-5 Async: {'✅' if async_success else '❌'}")
    print(f"GPT-5 Streaming: {'✅' if streaming_success else '❌'}")

    if streaming_success:
        print("\n🎉 GPT-5 streaming works! Your agent should work fine.")
    elif sync_success or async_success:
        print(
            "\n⚠️  GPT-5 works but streaming might have issues. Check organization verification."
        )
    else:
        print("\n❌ GPT-5 not accessible. Check API key and organization verification.")
        print("💡 Visit: https://platform.openai.com/settings/organization/general")


if __name__ == "__main__":
    asyncio.run(main())
