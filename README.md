# Vinyl Record Player and Speech-to-Text System

This is a web application that combines a vinyl record player simulation with speech-to-text functionality.

## Features

- **Left Side**: Vinyl Record Player Simulator
  - Select different vinyl records for display
  - Simulated vinyl rotation animation
  - Tonearm animation

- **Right Side**: Speech-to-Text System
  - Recording functionality
  - Send recordings to server for processing
  - Display transcription results

## Getting Started

### Install Dependencies

```bash
npm install express multer path fs child_process axios form-data
```

### Start Backend Server

```bash
node api-server.js
```

### Open Frontend Page

Visit http://localhost:3000 in your browser

## Technology Stack

- Frontend: p5.js, p5.sound.js
- Backend: Node.js, Express
- Audio Processing: FFmpeg (for audio conversion)

## Notes

- Microphone permission is required for recording
- Transcription feature requires connection to the backend server
- Current version uses simulated transcription results; in a real application, it can be connected to speech recognition APIs like Whisper