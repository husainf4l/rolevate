from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import os
from google.cloud import speech
from openai import OpenAI
from dotenv import load_dotenv
import asyncio
import wave
import tempfile

load_dotenv()

app = FastAPI()

@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.websocket("/ws/google")
async def websocket_google(websocket: WebSocket):
    """Google Speech-to-Text streaming recognition"""
    await websocket.accept()
    
    try:
        client = speech.SpeechClient()
        
        streaming_config = speech.StreamingRecognitionConfig(
            config=speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="ar-SA",
            ),
            interim_results=True,
        )
        
        def request_generator():
            """Generator that yields audio requests from buffer"""
            while True:
                try:
                    # This needs to be synchronous for Google's API
                    # We'll use a different approach
                    yield None
                except:
                    break
        
        # Use a simpler batch approach
        audio_buffer = bytearray()
        batch_size = 16000 * 2 * 2  # 2 seconds of audio
        
        while True:
            try:
                chunk = await asyncio.wait_for(websocket.receive_bytes(), timeout=0.5)
                audio_buffer.extend(chunk)
                
                # Process when we have enough audio
                if len(audio_buffer) >= batch_size:
                    try:
                        # Create a single request with the audio
                        audio_content = bytes(audio_buffer[:batch_size])
                        
                        # Use the non-streaming API for simplicity and reliability
                        audio = speech.RecognitionAudio(content=audio_content)
                        config = speech.RecognitionConfig(
                            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                            sample_rate_hertz=16000,
                            language_code="ar-SA",
                        )
                        
                        response = client.recognize(config=config, audio=audio)
                        
                        for result in response.results:
                            if result.alternatives:
                                await websocket.send_json({
                                    "transcript": result.alternatives[0].transcript,
                                    "is_final": True
                                })
                        
                        # Keep remaining buffer
                        audio_buffer = audio_buffer[batch_size:]
                        
                    except Exception as e:
                        print(f"Google transcription error: {e}")
                        await websocket.send_json({"error": str(e)})
                        
            except asyncio.TimeoutError:
                continue
            except WebSocketDisconnect:
                break
        
    except Exception as e:
        await websocket.send_json({"error": f"خطأ في Google: {str(e)}"})
    finally:
        try:
            await websocket.close()
        except:
            pass

@app.websocket("/ws/whisper")
async def websocket_whisper(websocket: WebSocket):
    """OpenAI Whisper streaming recognition"""
    await websocket.accept()
    
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        audio_buffer = bytearray()
        chunk_size = 16000 * 2 * 5  # 5 seconds
        
        while True:
            try:
                chunk = await asyncio.wait_for(websocket.receive_bytes(), timeout=0.5)
                audio_buffer.extend(chunk)
                
                if len(audio_buffer) >= chunk_size:
                    try:
                        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                            temp_path = temp_file.name
                            
                            with wave.open(temp_path, 'wb') as wav_file:
                                wav_file.setnchannels(1)
                                wav_file.setsampwidth(2)
                                wav_file.setframerate(16000)
                                wav_file.writeframes(bytes(audio_buffer[:chunk_size]))
                        
                        with open(temp_path, 'rb') as audio_file:
                            transcript = client.audio.transcriptions.create(
                                file=audio_file,
                                model="whisper-1",
                                language="ar"
                            )
                        
                        if transcript.text.strip():
                            await websocket.send_json({
                                "transcript": transcript.text,
                                "is_final": False
                            })
                        
                        os.unlink(temp_path)
                        audio_buffer = audio_buffer[chunk_size:]
                        
                    except Exception as e:
                        print(f"Whisper error: {e}")
                        audio_buffer = bytearray()
                        
            except asyncio.TimeoutError:
                continue
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        await websocket.send_json({"error": f"خطأ في Whisper: {str(e)}"})
    finally:
        try:
            await websocket.close()
        except:
            pass
