# Tamil Mind Mate - AI Therapy Assistant# Mental AI Assistant - Tamil Voice Support



**Mental health support chatbot with Tamil & English support****Client-first mental health support with Tamil voice interaction**



A mobile-first voice and text-based mental health assistant providing grounding exercises, crisis support, and emotional guidance for PTSD treatment.Audio stays on your device. Only text is processed when generating responses (Phase A). Phase B will move all processing on-device.



------



## 🎯 What It Does## 📖 **NEW TO THIS PROJECT?**



- **Distress Assessment**: SUDS scale (0-10) to track emotional state👉 **Start here: [DELIVERY.md](./DELIVERY.md)** - Complete delivery summary, next steps, and acceptance criteria  

- **AI Conversations**: Trauma-informed responses using Groq Llama-3.3-70B👉 **Or read: [TRANSFORMATION.md](./TRANSFORMATION.md)** - Full before/after transformation overview  

- **Grounding Exercises**: Pre-recorded therapeutic audio (breathing, sensory awareness, countdown)👉 **Navigation: [DOCS.md](./DOCS.md)** - Guide to all documentation

- **Crisis Detection**: Real-time safety monitoring with helpline signposting

- **Bilingual Support**: Full English and Tamil language switching---

- **Session Tracking**: Transcript history and progress monitoring

## �️ Architecture

---

```

## 🏗️ Architecturemental-ai-assistant/

├── frontend/           # React + Vite + TypeScript + Tailwind

```└── services/          # FastAPI microservices (local only)

tamil-mind-mate/    ├── media-service/     # Port 8001 - Audio chunk handling

├── frontend/              # React 18 + TypeScript + Vite    ├── speech-service/    # Port 8002 - STT/TTS

│   ├── src/    └── reasoning-service/ # Port 8003 - LLM + Safety guardrails

│   │   ├── components/mobile/  # Mobile-first UI screens```

│   │   ├── hooks/              # useSession, useTranslation

│   │   ├── i18n/               # English & Tamil translations## 🚀 Quick Start

│   │   └── api/                # Backend API client

│   └── public/audio/exercises/ # Therapeutic audio files### Prerequisites

│

└── services/              # FastAPI microservices- **Node.js** ≥18

    ├── speech-service/    # STT (Groq Whisper) + TTS (Google Cloud)- **Python** 3.11+

    └── reasoning-service/ # LLM (Groq Llama) + Safety detection- **FFmpeg** (for audio processing)

```

### 1. Install Dependencies

**Tech Stack:**

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite```bash

- **Backend**: Python 3.11, FastAPI, uvicorn# Frontend

- **AI Services**: Groq API (STT + LLM), Google Cloud TTScd frontend

- **Audio**: Pre-generated MP3 exercises + real-time TTSnpm install



---# Each service

cd services/media-service && pip install -r requirements.txt

## 🚀 Quick Startcd ../speech-service && pip install -r requirements.txt

cd ../reasoning-service && pip install -r requirements.txt

### Prerequisites```

- Node.js 18+ and npm

- Python 3.11+### 2. Configure Environment

- Groq API key (for STT and LLM)

- Google Cloud service account (for TTS)Copy `.env.example` to `.env` in each directory and add your API keys (Phase A only):



### 1. Clone Repository```bash

```bashcp frontend/.env.example frontend/.env

git clone https://github.com/sahanbull/welcome_mental_health_app.gitcp services/speech-service/.env.example services/speech-service/.env

cd welcome_mental_health_appcp services/reasoning-service/.env.example services/reasoning-service/.env

``````



### 2. Set Up Backend Services### 3. Run Services



#### Speech Service (Port 8002)```bash

```bash# Terminal 1 - Media Service

cd services/speech-servicecd services/media-service

python3 -m venv venvuvicorn app.main:app --reload --port 8001

source venv/bin/activate

pip install -r requirements.txt# Terminal 2 - Speech Service

cd services/speech-service

# Create .env fileuvicorn app.main:app --reload --port 8002

cat > .env << EOF

STT_PROVIDER=api# Terminal 3 - Reasoning Service

TTS_PROVIDER=apicd services/reasoning-service

GROQ_API_KEY=your_groq_api_key_hereuvicorn app.main:app --reload --port 8003

GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/gcp-credentials.json

EOF# Terminal 4 - Frontend

cd frontend

# Start servicenpm run dev

bash start.sh```

```

Open **http://localhost:5173**

#### Reasoning Service (Port 8003)

```bash## 🎯 Features

cd services/reasoning-service

python3 -m venv venv- 🎤 **Push-to-talk voice recording** with device selection

source venv/bin/activate- 🗣️ **Tamil speech recognition** (partial + final transcripts)

pip install -r requirements.txt- 🧠 **Safety-checked AI responses** with crisis detection

- 🔊 **Tamil text-to-speech** replies

# Create .env file- 🚨 **Crisis help** always visible with helpline info

cat > .env << EOF- 📝 **Real-time transcript** display

REASONER=server- ♿ **Accessible** keyboard control, screen reader support

GROQ_API_KEY=your_groq_api_key_here

EOF## 📋 Phase A vs Phase B



# Start service### Phase A (Current - Accuracy First)

bash start.sh- **STT**: Groq Whisper large-v3-turbo API

```- **TTS**: Google Cloud TTS (ta-IN)

- **LLM**: Groq Llama-3.3-70B API

### 3. Set Up Frontend (Port 8081)- Audio stays on device; only text sent to APIs

```bash

cd frontend### Phase B (Future - Privacy First)

npm install- **STT**: On-device Whisper Tiny/Base

npm run dev- **TTS**: System TTS or bundled MMS-TTS

```- **LLM**: Quantized 1-3B local model

- Everything runs on-device

### 4. Access the App

Open your browser to:## 🧪 Testing

```

http://localhost:8081/mobile```bash

```# Backend tests

cd services/speech-service

---pytest



## 📱 Usagecd services/reasoning-service

pytest

### Quick Test Flow

1. **Open**: http://localhost:8081/mobile# Frontend tests

2. **Select Language**: Toggle between English and Tamil (top right)cd frontend

3. **Set Distress Level**: Move SUDS slider (0-10)npm test

4. **Start Session**: Click "Let's Start"```

5. **Chat**: Type or speak your concerns

6. **Exercises**: Access grounding exercises (top right button)## 🔒 Privacy & Safety

7. **Transcript**: View conversation history

- Audio files never leave the device

### Testing with Exercises- Text-only processing in Phase A (with user consent)

1. In conversation screen, click "Exercises" button- Crisis detection with immediate helpline information

2. Select an exercise:- No cloud storage of conversations

   - **General Grounding**: 5-4-3-2-1 sensory awareness- Local-only risk event logging

   - **Paced Breathing**: 4-6 breathing pattern

   - **Countdown**: 10 to 1 relaxation## 📞 Crisis Resources

3. Audio plays automatically

4. Return to conversation when complete**Tamil Nadu State Mental Health Helpline**: 044-46464646  

**National Crisis Helpline (India)**: 9152987821

---

## � License

## ⚙️ Configuration

Internal use only. Not for redistribution.

### Environment Variables

### Prerequisites

#### Speech Service (`services/speech-service/.env`)- Node.js 18+

```bash- npm or yarn

STT_PROVIDER=api              # Speech-to-text provider (api/local)

TTS_PROVIDER=api              # Text-to-speech provider (api/local)### Installation

GROQ_API_KEY=your_key         # Groq API key for Whisper STT

GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json```bash

```# Install dependencies

npm install

#### Reasoning Service (`services/reasoning-service/.env`)

```bash# Create environment file

REASONER=server               # LLM provider (server/local)cp .env.example .env

GROQ_API_KEY=your_key         # Groq API key for Llama LLM

```# Configure your backend API URL in .env

VITE_API_URL=http://localhost:8000

### API Providers

# Start development server

**Current Setup (API-based):**npm run dev

- **STT**: Groq Whisper large-v3-turbo```

- **TTS**: Google Cloud Text-to-Speech (en-GB, ta-IN voices)

- **LLM**: Groq Llama-3.3-70B-versatileThe app will be available at `http://localhost:8080`



**Alternative (Local):**### Build for Production

See `PHASE_TOGGLE_GUIDE.md` for switching to local models.```bash

npm run build

---```



## 🔧 API Setup## 🔧 Backend Setup (Separate Deployment)



### Groq APIThe backend consists of 4 FastAPI microservices. See `BACKEND.md` for detailed setup.

1. Sign up at https://console.groq.com

2. Create API key### Quick Start

3. Add to `.env` files in both services```bash

# Each service should be run separately or via Docker Compose

### Google Cloud TTScd services/media-service && uvicorn app.main:app --port 8003

1. Create project at https://console.cloud.google.comcd services/transcription-service && uvicorn app.main:app --port 8005

2. Enable Text-to-Speech APIcd services/reasoning-service && uvicorn app.main:app --port 8007

3. Create service account with TTS permissionscd services/auth-gateway && uvicorn app.main:app --port 8001

4. Download JSON key```

5. Place at `~/.gcp/tts-credentials.json`

6. Update `GOOGLE_APPLICATION_CREDENTIALS` path### Required API Keys

- `GROQ_API_KEY` - For Whisper STT and LLaMA reasoning

**Detailed setup**: See `GOOGLE_CLOUD_TTS_SETUP.md`- `GOOGLE_TTS_PROJECT_ID` & `GOOGLE_TTS_KEY` - For Tamil TTS

- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - For authentication (stub)

---

## 🎨 Design System

## 🧪 Testing

The UI uses a calming color palette optimized for mental wellness:

### Check Service Health

```bash- **Primary**: Purple gradient (262° 52% 47%)

# Speech Service- **Secondary**: Blue tones (220° 60% 60%)

curl http://localhost:8002/health- **Accent**: Teal (180° 60% 55%)

- **Gradients**: Soft purple-blue transitions

# Reasoning Service- **Typography**: Clean, readable fonts with ample spacing

curl http://localhost:8003/health

```All colors are semantic tokens defined in `src/index.css` and `tailwind.config.ts`.



### Test AI Response## 🔒 Safety Features

```bash

curl -X POST http://localhost:8003/respond \### Pre-Check (Before LLM)

  -H "Content-Type: application/json" \- Detects self-harm keywords

  -d '{- Identifies medical advice requests

    "session_id": "test",- Flags acute crisis situations

    "transcript_window": ["I am feeling anxious"],

    "locale": "en-GB"### Post-Check (After LLM)

  }'- Validates response safety

```- Replaces unsafe content with safe templates

- Triggers clinician alerts when needed

Expected response:

```json### Visual Indicators

{- 🔴 Safety alerts shown in transcript

  "reply_text": "I hear you, feeling anxious can be really overwhelming...",- ⚠️ Crisis warnings with support resources

  "risk_flags": {- 📊 Risk flags stored per session

    "has_self_harm": false,

    "has_medical_advice": false,## 📱 Usage

    "needs_escalation": false

  },1. **Select Microphone**: Choose your audio input device

  "processing_time_ms": 4002. **Press & Hold**: Push the microphone button to speak

}3. **Speak in Tamil**: Your speech is transcribed in real-time

```4. **Get Response**: AI processes your message with safety checks

5. **Listen**: Tamil audio response plays automatically

---

## 🧪 Development

## 🐛 Troubleshooting

### Project Structure

### Frontend won't load```

```bashsrc/

# Kill processes├─ components/

pkill -9 -f "vite"│  ├─ DevicePicker.tsx       # Audio device selection

│  ├─ VoiceButton.tsx        # Push-to-talk control

# Restart│  └─ TranscriptPane.tsx     # Message history

cd frontend && npm run dev├─ hooks/

```│  └─ useRecorder.ts         # MediaRecorder with chunking

├─ state/

### Backend services not responding│  └─ useSessionStore.ts     # Zustand session state

```bash├─ api/

# Check if running│  └─ client.ts              # Axios API client

lsof -i :8002└─ pages/

lsof -i :8003   └─ Demo.tsx               # Main application page

```

# Kill if stuck

pkill -9 -f "uvicorn"### API Integration



# RestartThe frontend expects these backend endpoints:

cd services/speech-service && bash start.sh

cd services/reasoning-service && bash start.sh```typescript

```POST /media/chunk-upload        // Upload audio chunks

POST /transcribe/chunk          // Get transcript from chunk

### "Thinking..." loop (no AI response)POST /respond                   // Get AI response with safety check

1. Open browser console (F12)POST /tts/generate              // Generate Tamil audio

2. Check for errorsGET  /health                    // Service health checks

3. Verify backend: `curl http://localhost:8003/health````

4. Check Groq API key is set correctly

## 🌐 Environment Variables

### Exercise audio not playing

1. Verify files exist: `ls frontend/public/audio/exercises/`### Frontend (.env)

2. Should have: `general.mp3`, `breathing.mp3`, `countdown.mp3````bash

3. Check browser console for audio errorsVITE_API_URL=http://localhost:8000

```

---

### Backend Services

## 📚 DocumentationSee individual service README files for complete environment configuration.



- **ARCHITECTURE.md** - System design and data flows## 📊 Current Status

- **PHASE_TOGGLE_GUIDE.md** - Switch between API and local providers

- **GOOGLE_CLOUD_TTS_SETUP.md** - Google Cloud TTS configuration**Week 1 MVP - ✅ Complete**

- **SYSTEM_FIXED.md** - Latest bug fixes and solutions- ✅ Frontend UI with push-to-talk

- **CRITICAL_FIXES_APPLIED.md** - Technical details of recent fixes- ✅ Device picker and audio recording

- ✅ Transcript display with safety indicators

---- ✅ API client ready for backend integration

- ⏳ Backend services (deploy separately)

## 🛡️ Safety & Clinical Protocols

**Non-Goals (Week 1)**

### Crisis Detection- ❌ Fine-tuning models

- Real-time monitoring for self-harm and suicide ideation- ❌ Analytics dashboards  

- Automatic helpline signposting (044-46464646 for India)- ❌ Session persistence beyond memory

- Risk flags logged to `services/reasoning-service/risk-log.jsonl`- ❌ User authentication (stub only)



### Therapeutic Approach## 🔗 Related Documentation

- Trauma-informed language patterns

- Empathetic, non-judgmental responses- `BACKEND.md` - Backend microservices setup

- Grounding exercises based on clinical protocols- `.env.example` - Environment configuration template

- SUDS tracking for progress monitoring- Service READMEs in `services/*/README.md`



---## 📄 License



## 🚧 Known LimitationsMIT



- Voice input (STT) not fully tested in production## 🙏 Acknowledgments

- Real-time TTS uses pre-recorded exercise audio for reliability

- Session persistence uses localStorage (clears on browser close)Inspired by the TalentSync interview agent architecture and mental wellness design patterns from Calm and Headspace.

- Crisis detection currently keyword-based (ML model in development)

---

## 📝 License

This project is part of a research initiative for mental health support in Tamil-speaking communities.

---

## 🙏 Acknowledgments

- Freedom from Torture for clinical guidance
- Tamil-speaking survivors for feedback
- Groq for AI infrastructure
- Google Cloud for TTS services

---

## 📧 Support

For technical issues, see `SYSTEM_FIXED.md` for recent troubleshooting solutions.

For clinical questions, contact the Freedom from Torture team.

---

**Last Updated**: November 5, 2025  
**Version**: 1.0.0  
**Status**: Operational and tested
