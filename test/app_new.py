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
        
        # Buffer audio chunks
        audio_buffer = []
        
        async def receive_and_process():
            try:
                while True:
                    chunk = await websocket.receive_bytes()
                    request = speech.StreamingRecognizeRequest(audio_content=chunk)
                    audio_buffer.append(request)
                    
                    # Process every 10 chunks
                    if len(audio_buffer) >= 10:
                        try:
                            responses = client.streaming_recognize(streaming_config, iter(audio_buffer))
                            
                            for response in responses:
                                for result in response.results:
                                    if result.alternatives:
                                        await websocket.send_json({
                                            "transcript": result.alternatives[0].transcript,
                                            "is_final": result.is_final
                                        })
                            
                            audio_buffer.clear()
                        except Exception as e:
                            print(f"Google error: {e}")
                            
            except WebSocketDisconnect:
                pass
                
        await receive_and_process()
        
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
