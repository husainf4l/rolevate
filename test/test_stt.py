import os
import sys
from dotenv import load_dotenv
from gtts import gTTS

# Load environment variables
load_dotenv()

# Google Speech-to-Text
from google.cloud import speech

# Azure Speech Services
import azure.cognitiveservices.speech as speechsdk

# AWS Transcribe
import boto3

# OpenAI Whisper
import openai

def transcribe_google(audio_file_path):
    client = speech.SpeechClient()
    with open(audio_file_path, 'rb') as audio_file:
        content = audio_file.read()
    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code='ar-SA',  # Arabic
    )
    response = client.recognize(config=config, audio=audio)
    return ' '.join([result.alternatives[0].transcript for result in response.results])

def transcribe_azure(audio_file_path):
    speech_key = os.getenv('AZURE_SPEECH_KEY')
    service_region = os.getenv('AZURE_SPEECH_REGION')
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.speech_recognition_language = 'ar-SA'
    audio_config = speechsdk.AudioConfig(filename=audio_file_path)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    result = speech_recognizer.recognize_once()
    return result.text if result.reason == speechsdk.ResultReason.RecognizedSpeech else str(result.reason)

def transcribe_aws(audio_file_path):
    transcribe = boto3.client('transcribe',
                              aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                              aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                              region_name=os.getenv('AWS_REGION'))
    job_name = 'arabic-stt-test'
    # Assume audio is in S3, but for local, need to upload first. Placeholder.
    # For simplicity, this is a placeholder. In real, upload to S3 and transcribe.
    return "AWS Transcribe result placeholder - requires S3 upload"

def transcribe_whisper(audio_file_path):
    openai.api_key = os.getenv('OPENAI_API_KEY')
    with open(audio_file_path, 'rb') as audio_file:
        transcript = openai.Audio.transcribe("whisper-1", audio_file, language='ar')
    return transcript['text']

def main(audio_file_path=None):
    if not audio_file_path or not os.path.exists(audio_file_path):
        print("No audio file provided or file not found. Creating a sample Arabic audio file...")
        sample_text = "مرحبا، هذا اختبار للنطق العربي."  # Hello, this is a test for Arabic speech.
        tts = gTTS(text=sample_text, lang='ar')
        audio_file_path = 'sample_arabic.mp3'
        tts.save(audio_file_path)
        print(f"Sample audio saved as {audio_file_path}")

    print("Testing Arabic STT Models:\n")

    try:
        print("Google Speech-to-Text:")
        result = transcribe_google(audio_file_path)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

    try:
        print("\nAzure Speech Services:")
        result = transcribe_azure(audio_file_path)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

    try:
        print("\nAWS Transcribe:")
        result = transcribe_aws(audio_file_path)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

    try:
        print("\nOpenAI Whisper:")
        result = transcribe_whisper(audio_file_path)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    audio_file = sys.argv[1] if len(sys.argv) > 1 else None
    main(audio_file)
