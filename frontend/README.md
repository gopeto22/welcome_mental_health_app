# Mental AI Assistant - Frontend

React + Vite + TypeScript + Tailwind frontend for Tamil voice mental health support.

## Features

- 🎤 Push-to-talk voice recording with device selection
- 🗣️ Real-time transcription display
- 💬 AI-powered responses with safety checks
- 🚨 Always-visible crisis help information
- ♿ Accessible keyboard controls and ARIA support

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
```

Open **http://localhost:5173**

## Environment Variables

Create `.env` file:

```bash
# Backend services (local only)
VITE_MEDIA_SERVICE_URL=http://localhost:8001
VITE_SPEECH_SERVICE_URL=http://localhost:8002
VITE_REASONING_SERVICE_URL=http://localhost:8003
```

## Project Structure

```
src/
├── components/        # UI components
│   ├── AppHeader.tsx
│   ├── ConsentBanner.tsx
│   ├── CrisisHelp.tsx
│   ├── DevicePicker.tsx
│   ├── StatusChip.tsx
│   ├── TranscriptPane.tsx
│   ├── VoiceButton.tsx
│   └── ui/           # Base UI components
├── hooks/            # Custom hooks
│   ├── useRecorder.ts
│   └── useSession.ts
├── api/              # API client
│   └── client.ts
├── lib/              # Utilities
│   └── utils.ts
├── App.tsx           # Main app
└── main.tsx          # Entry point
```

## Components

### AppHeader
Title bar with "Tamil Voice Support" indicator.

### ConsentBanner
Privacy notice explaining audio processing.

### CrisisHelp
Always-visible helpline information.

### DevicePicker
Microphone device selection dropdown.

### VoiceButton
Large, accessible push-to-talk button with visual feedback.

### StatusChip
Shows current state: Idle · Listening · Transcribing · Responding · Speaking

### TranscriptPane
Displays conversation history with user/assistant messages.

## Hooks

### useRecorder
Manages MediaRecorder for 2-3 second audio chunking.

### useSession
Manages session state (ID, timings, risk flags).

## Accessibility

- Keyboard controls: Space/Enter to start/stop recording
- ARIA live regions for status updates
- High contrast UI (4.5:1 minimum)
- Large touch targets (≥24px)
- Screen reader friendly

## Building

```bash
npm run build
# Output in dist/
```

## Privacy

- Audio files never leave the device
- Only text transcripts sent to backend for processing (Phase A)
- Phase B will move all processing on-device
