const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple Node.js recorder using ffmpeg
class SimpleRecorder {
    constructor() {
        this.recordingProcess = null;
        this.recordingsDir = './recordings';
        
        // Create recordings directory if it doesn't exist
        if (!fs.existsSync(this.recordingsDir)) {
            fs.mkdirSync(this.recordingsDir, { recursive: true });
        }
    }

    startRecording(roomName, outputFilename) {
        return new Promise((resolve, reject) => {
            if (this.recordingProcess) {
                reject(new Error('Recording already in progress'));
                return;
            }

            const outputPath = path.join(this.recordingsDir, outputFilename);
            
            // This is a placeholder - you'll need to replace with actual LiveKit room URL
            // For now, this creates a simple test recording
            const command = `ffmpeg -f avfoundation -i ":0" -t 60 -c:a aac "${outputPath}"`;
            
            console.log(`Starting recording: ${outputPath}`);
            
            this.recordingProcess = exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Recording error: ${error}`);
                    reject(error);
                } else {
                    console.log(`Recording completed: ${outputPath}`);
                    resolve(outputPath);
                }
                this.recordingProcess = null;
            });

            console.log(`Recording started for room: ${roomName}`);
            resolve(`Recording started: ${outputPath}`);
        });
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (this.recordingProcess) {
                this.recordingProcess.kill('SIGTERM');
                this.recordingProcess = null;
                console.log('Recording stopped');
                resolve('Recording stopped');
            } else {
                resolve('No recording in progress');
            }
        });
    }
}

// CLI usage
if (require.main === module) {
    const recorder = new SimpleRecorder();
    const action = process.argv[2];
    const roomName = process.argv[3] || 'default_room';
    const filename = process.argv[4] || `${roomName}_${Date.now()}.mp4`;

    if (action === 'start') {
        recorder.startRecording(roomName, filename)
            .then(result => console.log(result))
            .catch(error => console.error(error));
    } else if (action === 'stop') {
        recorder.stopRecording()
            .then(result => console.log(result));
    } else {
        console.log('Usage:');
        console.log('  node simple_recorder.js start [room_name] [filename]');
        console.log('  node simple_recorder.js stop');
    }
}

module.exports = SimpleRecorder;
