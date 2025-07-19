#!/usr/bin/env python3
"""
Simple recording script that can be called from the LiveKit agent
"""
import subprocess
import os
import sys
import signal
import time
from pathlib import Path


class SimpleRecorder:
    def __init__(self):
        self.recording_process = None
        self.recordings_dir = Path("./recordings")
        self.recordings_dir.mkdir(exist_ok=True)

    def start_recording(self, room_name, job_id):
        """Start recording using system tools"""
        if self.recording_process:
            print("Recording already in progress")
            return False

        output_file = self.recordings_dir / f"{room_name}_{job_id}.mp4"

        # For macOS, you can use screen capture
        # For Linux, you might need different commands
        # This is a placeholder - adjust based on your system
        if sys.platform == "darwin":  # macOS
            # Record system audio and video (adjust as needed)
            cmd = [
                "ffmpeg",
                "-f",
                "avfoundation",
                "-i",
                ":0",  # Audio input
                "-t",
                "3600",  # 1 hour max
                "-c:a",
                "aac",
                str(output_file),
            ]
        else:  # Linux
            cmd = [
                "ffmpeg",
                "-f",
                "pulse",
                "-i",
                "default",
                "-t",
                "3600",
                "-c:a",
                "aac",
                str(output_file),
            ]

        try:
            print(f"Starting recording: {output_file}")
            self.recording_process = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            print(f"Recording started with PID: {self.recording_process.pid}")
            return True
        except Exception as e:
            print(f"Failed to start recording: {e}")
            return False

    def stop_recording(self):
        """Stop the current recording"""
        if self.recording_process:
            try:
                self.recording_process.send_signal(signal.SIGTERM)
                self.recording_process.wait(timeout=10)
                print("Recording stopped successfully")
            except subprocess.TimeoutExpired:
                self.recording_process.kill()
                print("Recording forcefully stopped")
            except Exception as e:
                print(f"Error stopping recording: {e}")
            finally:
                self.recording_process = None
        else:
            print("No recording in progress")


def main():
    recorder = SimpleRecorder()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python simple_recorder.py start <room_name> <job_id>")
        print("  python simple_recorder.py stop")
        return

    action = sys.argv[1]

    if action == "start" and len(sys.argv) >= 4:
        room_name = sys.argv[2]
        job_id = sys.argv[3]
        recorder.start_recording(room_name, job_id)
    elif action == "stop":
        recorder.stop_recording()
    else:
        print("Invalid command")


if __name__ == "__main__":
    main()
