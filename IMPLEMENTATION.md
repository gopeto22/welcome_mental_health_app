# Implementation Guide - Mental AI Assistant

This document provides complete file listings for the clean frontend implementation.

## Directory Structure

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── ConsentBanner.tsx
│   │   ├── CrisisHelp.tsx
│   │   ├── DevicePicker.tsx
│   │   ├── StatusChip.tsx
│   │   ├── TranscriptPane.tsx
│   │   ├── VoiceButton.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── hooks/
│   │   ├── useRecorder.ts
│   │   └── useSession.ts
│   ├── api/
│   │   └── client.ts
│   └── lib/
│       └── utils.ts
├── index.html
├── package.json (use package-clean.json)
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
└── README.md
```

## Key Changes from Existing Code

### 1. Remove All Lovable References

**Files to delete/clean:**
- Remove `lovable-tagger` from package.json
- Remove Supabase integration (`src/integrations/supabase/`)
- Remove all unused shadcn/ui components (keep only Button, Label, Select)
- Remove `@tanstack/react-query`, `sonner`, `react-router-dom`

### 2. API Client (`src/api/client.ts`)

Replace with:
```typescript
const MEDIA_URL = import.meta.env.VITE_MEDIA_SERVICE_URL || 'http://localhost:8001';
const SPEECH_URL = import.meta.env.VITE_SPEECH_SERVICE_URL || 'http://localhost:8002';
const REASONING_URL = import.meta.env.VITE_REASONING_SERVICE_URL || 'http://localhost:8003';

export const api = {
  uploadChunk: async (sessionId: string, sequenceIndex: number, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, `chunk_${sequenceIndex}.webm`);
    
    const response = await fetch(
      `${MEDIA_URL}/media/chunk-upload?session_id=${sessionId}&sequence_index=${sequenceIndex}`,
      { method: 'POST', body: formData }
    );
    return response.json();
  },

  getResponse: async (sessionId: string, transcriptWindow: string[], locale: string = 'ta-IN') => {
    const response = await fetch(`${REASONING_URL}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, transcript_window: transcriptWindow, locale })
    });
    return response.json();
  },

  generateTTS: async (text: string, voice: string = 'ta-IN') => {
    const response = await fetch(`${SPEECH_URL}/tts/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    return response.json();
  },
  
  checkHealth: async (service: 'media' | 'speech' | 'reasoning') => {
    const urls = {
      media: `${MEDIA_URL}/health`,
      speech: `${SPEECH_URL}/health`,
      reasoning: `${REASONING_URL}/health`
    };
    const response = await fetch(urls[service]);
    return response.json();
  }
};
```

### 3. App.tsx (Main Component)

```typescript
import { useState, useCallback } from 'react';
import { AppHeader } from './components/AppHeader';
import { ConsentBanner } from './components/ConsentBanner';
import { CrisisHelp } from './components/CrisisHelp';
import { DevicePicker } from './components/DevicePicker';
import { VoiceButton } from './components/VoiceButton';
import { StatusChip } from './components/StatusChip';
import { TranscriptPane, Message } from './components/TranscriptPane';
import { useRecorder } from './hooks/useRecorder';
import { useSession } from './hooks/useSession';
import { api } from './api/client';

type Status = 'idle' | 'listening' | 'transcribing' | 'responding' | 'speaking';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { sessionId, incrementChunk } = useSession();

  const handleChunkReady = useCallback(async (chunk: Blob, sequenceIndex: number) => {
    if (!sessionId) return;
    
    try {
      setStatus('transcribing');
      
      // Upload and get transcription
      const result = await api.uploadChunk(sessionId, sequenceIndex, chunk);
      
      if (result.final_text) {
        // Add user message
        const userMessage: Message = {
          role: 'user',
          content: result.final_text,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setStatus('responding');
        
        // Get AI response
        const transcriptWindow = messages.slice(-4).map(m => m.content).concat(result.final_text);
        const response = await api.getResponse(sessionId, transcriptWindow);
        
        // Generate TTS
        setStatus('speaking');
        const tts = await api.generateTTS(response.reply_text);
        
        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.reply_text,
          timestamp: new Date(),
          audioUrl: `${import.meta.env.VITE_SPEECH_SERVICE_URL}${tts.file_url}`,
          riskFlags: response.risk_flags
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Play audio
        const audio = new Audio(assistantMessage.audioUrl);
        audio.onended = () => setStatus('idle');
        await audio.play();
      }
      
      incrementChunk();
    } catch (error) {
      console.error('Error processing chunk:', error);
      setStatus('idle');
    }
  }, [sessionId, messages, incrementChunk]);

  const { isRecording, startRecording, stopRecording } = useRecorder({
    deviceId: selectedDeviceId,
    onChunkReady: handleChunkReady
  });

  const handleStartRecording = () => {
    setStatus('listening');
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    if (status === 'listening') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <ConsentBanner />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Crisis Help - Always Visible */}
          <CrisisHelp />
          
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Device Picker */}
              <DevicePicker
                selectedDeviceId={selectedDeviceId}
                onDeviceChange={setSelectedDeviceId}
              />
              
              {/* Status */}
              <div className="flex justify-center">
                <StatusChip status={status} />
              </div>
              
              {/* Voice Button */}
              <div className="flex justify-center">
                <VoiceButton
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  disabled={status !== 'idle' && status !== 'listening'}
                />
              </div>
              
              {/* Mic Level Indicator */}
              {isRecording && (
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 animate-pulse" style={{width: '60%'}} />
                </div>
              )}
            </div>
          </div>
          
          {/* Transcript */}
          <TranscriptPane messages={messages} />
        </div>
      </main>
    </div>
  );
}

export default App;
```

### 4. New Components

**AppHeader.tsx:**
```typescript
export function AppHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Mental AI Assistant
        </h1>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          Tamil Voice Support
        </span>
      </div>
    </header>
  );
}
```

**ConsentBanner.tsx:**
```typescript
export function ConsentBanner() {
  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-blue-800">
        <p>
          🔒 <strong>Privacy:</strong> Audio stays on this device. 
          Only text may be sent to generate responses (Phase A). 
          No data is stored or shared.
        </p>
      </div>
    </div>
  );
}
```

**CrisisHelp.tsx:**
```typescript
import { PhoneCall } from 'lucide-react';

export function CrisisHelp() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <PhoneCall className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-semibold text-red-900">Crisis Help Available 24/7</h3>
          <div className="text-sm text-red-800 space-y-1">
            <p><strong>Tamil Nadu Mental Health:</strong> 044-46464646</p>
            <p><strong>National Crisis Helpline:</strong> 9152987821</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**StatusChip.tsx:**
```typescript
type Status = 'idle' | 'listening' | 'transcribing' | 'responding' | 'speaking';

interface StatusChipProps {
  status: Status;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = {
    idle: { label: 'Idle', color: 'bg-gray-100 text-gray-700' },
    listening: { label: 'Listening', color: 'bg-purple-100 text-purple-700' },
    transcribing: { label: 'Transcribing', color: 'bg-blue-100 text-blue-700' },
    responding: { label: 'Responding', color: 'bg-yellow-100 text-yellow-700' },
    speaking: { label: 'Speaking', color: 'bg-green-100 text-green-700' }
  };
  
  const { label, color } = config[status];
  
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium ${color}`}>
      {label}
    </span>
  );
}
```

### 5. Tailwind Config

Update `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // purple-600
      }
    },
  },
  plugins: [],
} satisfies Config
```

### 6. Vite Config

Update `vite.config.ts` to remove Lovable tagger:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## Migration Steps

1. **Backup existing frontend:**
   ```bash
   mv frontend frontend-old
   mkdir frontend
   ```

2. **Copy clean files:**
   - Use `package-clean.json` as `package.json`
   - Copy modified vite.config.ts, tailwind.config.ts
   - Keep only Button, Label, Select from ui components
   - Delete Supabase integration

3. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Copy useful parts from old frontend:**
   - `useRecorder.ts` hook (already good)
   - `DevicePicker.tsx` (modify to remove unused imports)
   - `VoiceButton.tsx` (simplify, remove heavy animations)
   - `TranscriptPane.tsx` (simplify)

5. **Create new components:** 
   - AppHeader, ConsentBanner, CrisisHelp, StatusChip (see above)

6. **Test:**
   ```bash
   npm run dev
   ```

## Testing Checklist

- [ ] All 3 backend services running and healthy
- [ ] Frontend loads at http://localhost:5173
- [ ] Device picker shows microphones
- [ ] Consent banner visible
- [ ] Crisis help always visible
- [ ] Voice button works (click or Space key)
- [ ] Status updates: Idle → Listening → Transcribing → Responding → Speaking
- [ ] Transcript shows user and assistant messages
- [ ] Audio plays for assistant responses
- [ ] Risk flags show when detected
- [ ] No console errors
- [ ] No Lovable references anywhere

## Phase B Preparation

When moving to on-device models:
1. Update backend `.env` files to use local providers
2. Frontend code requires no changes (API interface stays same)
3. Add on-device model loading indicators
4. Test offline functionality
