# Mental AI Assistant - Tamil Voice Support

**Client-first mental health support with Tamil voice interaction**

Audio stays on your device. Only text is processed when generating responses (Phase A). Phase B will move all processing on-device.

---

## 📖 **NEW TO THIS PROJECT?**

👉 **Start here: [DELIVERY.md](./DELIVERY.md)** - Complete delivery summary, next steps, and acceptance criteria  
👉 **Or read: [TRANSFORMATION.md](./TRANSFORMATION.md)** - Full before/after transformation overview  
👉 **Navigation: [DOCS.md](./DOCS.md)** - Guide to all documentation

---

## �️ Architecture

```
mental-ai-assistant/
├── frontend/           # React + Vite + TypeScript + Tailwind
└── services/          # FastAPI microservices (local only)
    ├── media-service/     # Port 8001 - Audio chunk handling
    ├── speech-service/    # Port 8002 - STT/TTS
    └── reasoning-service/ # Port 8003 - LLM + Safety guardrails
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥18
- **Python** 3.11+
- **FFmpeg** (for audio processing)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Each service
cd services/media-service && pip install -r requirements.txt
cd ../speech-service && pip install -r requirements.txt
cd ../reasoning-service && pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` in each directory and add your API keys (Phase A only):

```bash
cp frontend/.env.example frontend/.env
cp services/speech-service/.env.example services/speech-service/.env
cp services/reasoning-service/.env.example services/reasoning-service/.env
```

### 3. Run Services

```bash
# Terminal 1 - Media Service
cd services/media-service
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Speech Service
cd services/speech-service
uvicorn app.main:app --reload --port 8002

# Terminal 3 - Reasoning Service
cd services/reasoning-service
uvicorn app.main:app --reload --port 8003

# Terminal 4 - Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173**

## 🎯 Features

- 🎤 **Push-to-talk voice recording** with device selection
- 🗣️ **Tamil speech recognition** (partial + final transcripts)
- 🧠 **Safety-checked AI responses** with crisis detection
- 🔊 **Tamil text-to-speech** replies
- 🚨 **Crisis help** always visible with helpline info
- 📝 **Real-time transcript** display
- ♿ **Accessible** keyboard control, screen reader support

## 📋 Phase A vs Phase B

### Phase A (Current - Accuracy First)
- **STT**: Groq Whisper large-v3-turbo API
- **TTS**: Google Cloud TTS (ta-IN)
- **LLM**: Groq Llama-3.3-70B API
- Audio stays on device; only text sent to APIs

### Phase B (Future - Privacy First)
- **STT**: On-device Whisper Tiny/Base
- **TTS**: System TTS or bundled MMS-TTS
- **LLM**: Quantized 1-3B local model
- Everything runs on-device

## 🧪 Testing

```bash
# Backend tests
cd services/speech-service
pytest

cd services/reasoning-service
pytest

# Frontend tests
cd frontend
npm test
```

## 🔒 Privacy & Safety

- Audio files never leave the device
- Text-only processing in Phase A (with user consent)
- Crisis detection with immediate helpline information
- No cloud storage of conversations
- Local-only risk event logging

## 📞 Crisis Resources

**Tamil Nadu State Mental Health Helpline**: 044-46464646  
**National Crisis Helpline (India)**: 9152987821

## � License

Internal use only. Not for redistribution.

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your backend API URL in .env
VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
```

## 🔧 Backend Setup (Separate Deployment)

The backend consists of 4 FastAPI microservices. See `BACKEND.md` for detailed setup.

### Quick Start
```bash
# Each service should be run separately or via Docker Compose
cd services/media-service && uvicorn app.main:app --port 8003
cd services/transcription-service && uvicorn app.main:app --port 8005
cd services/reasoning-service && uvicorn app.main:app --port 8007
cd services/auth-gateway && uvicorn app.main:app --port 8001
```

### Required API Keys
- `GROQ_API_KEY` - For Whisper STT and LLaMA reasoning
- `GOOGLE_TTS_PROJECT_ID` & `GOOGLE_TTS_KEY` - For Tamil TTS
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - For authentication (stub)

## 🎨 Design System

The UI uses a calming color palette optimized for mental wellness:

- **Primary**: Purple gradient (262° 52% 47%)
- **Secondary**: Blue tones (220° 60% 60%)
- **Accent**: Teal (180° 60% 55%)
- **Gradients**: Soft purple-blue transitions
- **Typography**: Clean, readable fonts with ample spacing

All colors are semantic tokens defined in `src/index.css` and `tailwind.config.ts`.

## 🔒 Safety Features

### Pre-Check (Before LLM)
- Detects self-harm keywords
- Identifies medical advice requests
- Flags acute crisis situations

### Post-Check (After LLM)
- Validates response safety
- Replaces unsafe content with safe templates
- Triggers clinician alerts when needed

### Visual Indicators
- 🔴 Safety alerts shown in transcript
- ⚠️ Crisis warnings with support resources
- 📊 Risk flags stored per session

## 📱 Usage

1. **Select Microphone**: Choose your audio input device
2. **Press & Hold**: Push the microphone button to speak
3. **Speak in Tamil**: Your speech is transcribed in real-time
4. **Get Response**: AI processes your message with safety checks
5. **Listen**: Tamil audio response plays automatically

## 🧪 Development

### Project Structure
```
src/
├─ components/
│  ├─ DevicePicker.tsx       # Audio device selection
│  ├─ VoiceButton.tsx        # Push-to-talk control
│  └─ TranscriptPane.tsx     # Message history
├─ hooks/
│  └─ useRecorder.ts         # MediaRecorder with chunking
├─ state/
│  └─ useSessionStore.ts     # Zustand session state
├─ api/
│  └─ client.ts              # Axios API client
└─ pages/
   └─ Demo.tsx               # Main application page
```

### API Integration

The frontend expects these backend endpoints:

```typescript
POST /media/chunk-upload        // Upload audio chunks
POST /transcribe/chunk          // Get transcript from chunk
POST /respond                   // Get AI response with safety check
POST /tts/generate              // Generate Tamil audio
GET  /health                    // Service health checks
```

## 🌐 Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
```

### Backend Services
See individual service README files for complete environment configuration.

## 📊 Current Status

**Week 1 MVP - ✅ Complete**
- ✅ Frontend UI with push-to-talk
- ✅ Device picker and audio recording
- ✅ Transcript display with safety indicators
- ✅ API client ready for backend integration
- ⏳ Backend services (deploy separately)

**Non-Goals (Week 1)**
- ❌ Fine-tuning models
- ❌ Analytics dashboards  
- ❌ Session persistence beyond memory
- ❌ User authentication (stub only)

## 🔗 Related Documentation

- `BACKEND.md` - Backend microservices setup
- `.env.example` - Environment configuration template
- Service READMEs in `services/*/README.md`

## 📄 License

MIT

## 🙏 Acknowledgments

Inspired by the TalentSync interview agent architecture and mental wellness design patterns from Calm and Headspace.
