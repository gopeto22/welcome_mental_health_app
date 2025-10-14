# Phase A/B Toggle Guide

## Overview

This MVP supports **two phases**:

- **Phase A (API-based)**: Uses cloud APIs for accuracy (Groq Whisper, Google TTS, Groq Llama)
- **Phase B (On-device)**: Uses local models for privacy (whisper.cpp, system TTS, MLC-LLM)

**The UI remains identical.** Only backend providers change via environment flags.

---

## Quick Toggle

### Current Setup (Phase A)

```bash
# services/speech-service/.env
STT_PROVIDER=api
TTS_PROVIDER=api

# services/reasoning-service/.env
REASONER=server
```

### Switch to Phase B (Local)

```bash
# services/speech-service/.env
STT_PROVIDER=local
TTS_PROVIDER=local

# services/reasoning-service/.env
REASONER=local
```

**Then restart services:**

```bash
./stop-services.sh
./start-services.sh
```

---

## Provider Implementation Details

### 1. STT Provider (`services/speech-service/app/stt_provider.py`)

#### Phase A: Groq Whisper API
- **Model**: `whisper-large-v3-turbo`
- **Latency**: ~500-1500ms per chunk
- **Quality**: Excellent Tamil recognition
- **Cost**: ~$0.0001/second

#### Phase B: whisper.cpp (Local)
- **Model**: Tiny (39MB) or Base (74MB)
- **Latency**: ~2-4s per chunk (CPU), ~500ms (GPU)
- **Quality**: Good for simple utterances
- **Requirements**: Built C++ binary + GGML model file

**Toggle in code:**

```python
def get_stt_provider() -> STTProvider:
    provider = os.getenv("STT_PROVIDER", "api")
    if provider == "local":
        return LocalSTTProvider()  # whisper.cpp
    return GroqSTTProvider()  # Groq API
```

---

### 2. TTS Provider (`services/speech-service/app/tts_provider.py`)

#### Phase A: Google Cloud TTS
- **Voice**: `ta-IN-Standard-A` (Tamil female)
- **Latency**: ~800-1500ms
- **Quality**: Natural, expressive
- **Cost**: ~$0.000004/character

#### Phase B: System TTS (Local)
- **iOS**: AVSpeechSynthesizer with `ta-IN` voice
- **Android**: TextToSpeech with Tamil support
- **macOS/Linux**: `say` command or festival TTS
- **Latency**: ~500-1000ms
- **Quality**: Robotic but functional

**Toggle in code:**

```python
def get_tts_provider() -> TTSProvider:
    provider = os.getenv("TTS_PROVIDER", "api")
    if provider == "local":
        return LocalTTSProvider()  # System TTS
    return GoogleTTSProvider()  # Google Cloud
```

---

### 3. Reasoner (`services/reasoning-service/app/reasoner.py`)

#### Phase A: Groq Llama-3.3-70B
- **Model**: `llama-3.3-70b-versatile`
- **Latency**: ~1-3s for 100-200 token response
- **Quality**: Nuanced, empathetic, context-aware
- **Cost**: ~$0.0005/request

#### Phase B: MLC-LLM (Local)
- **Model**: Llama-3.2-1B or Phi-3-mini (1-3B quantized)
- **Latency**: ~3-8s for 100 tokens (CPU), ~1-2s (GPU)
- **Quality**: Simple, templated responses
- **Requirements**: MLC-LLM runtime + quantized model

**Toggle in code:**

```python
def get_reasoner() -> Reasoner:
    provider = os.getenv("REASONER", "server")
    if provider == "local":
        return LocalReasoner()  # MLC-LLM
    return GroqReasoner()  # Groq API
```

---

## HTTP Contract Stability

**All endpoints remain identical** regardless of provider:

| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /stt/chunk` | Audio file | `{ "transcript": "...", "timing_ms": 1234 }` |
| `POST /tts/speak` | `{ "text": "...", "locale": "ta-IN" }` | `{ "audioId": "...", "audioUrl": "/audio/cache/...", "timing_ms": 890 }` |
| `POST /respond` | `{ "user_input": "...", "session_id": "..." }` | `{ "response": "...", "riskFlags": {...}, "timing_ms": 2100 }` |

Frontend calls **never change**. Only backend provider switches.

---

## Phase B Setup Requirements

### 1. whisper.cpp (STT)

```bash
# Clone and build
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make

# Download Tiny model (39MB)
bash ./models/download-ggml-model.sh tiny

# Test
./main -m models/ggml-tiny.bin -f samples/jfk.wav
```

**Integrate in `LocalSTTProvider`:**

```python
import subprocess

class LocalSTTProvider(STTProvider):
    def transcribe(self, audio_path: str, locale: str) -> str:
        result = subprocess.run(
            ["./whisper.cpp/main", "-m", "models/ggml-tiny.bin", "-f", audio_path, "-l", "ta"],
            capture_output=True, text=True
        )
        # Parse result.stdout for transcript
        return parsed_text
```

---

### 2. System TTS

#### macOS:

```python
import subprocess

class LocalTTSProvider(TTSProvider):
    def synthesize(self, text: str, locale: str) -> bytes:
        # macOS 'say' command supports Tamil with Lekha voice
        subprocess.run(["say", "-v", "Lekha", "-o", "output.aiff", text])
        # Convert AIFF to MP3
        return audio_bytes
```

#### iOS (Swift):

```swift
import AVFoundation

let synthesizer = AVSpeechSynthesizer()
let utterance = AVSpeechUtterance(string: "வணக்கம்")
utterance.voice = AVSpeechSynthesisVoice(language: "ta-IN")
synthesizer.speak(utterance)
```

#### Android (Kotlin):

```kotlin
val tts = TextToSpeech(context) { status ->
    if (status == TextToSpeech.SUCCESS) {
        tts.language = Locale("ta", "IN")
        tts.speak("வணக்கம்", TextToSpeech.QUEUE_FLUSH, null, null)
    }
}
```

---

### 3. MLC-LLM (Reasoning)

```bash
# Install MLC-LLM
pip install mlc-llm mlc-ai-nightly

# Download quantized model (Llama-3.2-1B-Instruct-q4f16_1)
mlc_llm download mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC

# Test
mlc_llm chat mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC --prompt "Hello"
```

**Integrate in `LocalReasoner`:**

```python
from mlc_llm import ChatModule

class LocalReasoner(Reasoner):
    def __init__(self):
        self.model = ChatModule(model="mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC")
    
    def generate(self, messages: list) -> str:
        response = self.model.generate(messages, max_new_tokens=150)
        return response
```

---

## Performance Comparison

| Stage | Phase A (API) | Phase B (Local CPU) | Phase B (Local GPU) |
|-------|--------------|---------------------|---------------------|
| **STT** | 500-1500ms | 2000-4000ms | 500-1000ms |
| **Reasoning** | 1000-3000ms | 3000-8000ms | 1000-2000ms |
| **TTS** | 800-1500ms | 500-1000ms | 500-1000ms |
| **E2E Turn** | ~3-6s | ~6-13s | ~2-4s |

**Target**: ≤10s typical turn time

---

## Safety Guardrails (Same for Both Phases)

Safety checks are **independent of providers**:

1. **Pre-check** (keyword matching): Tamil/English crisis keywords → template response
2. **Post-check** (LLM output validation): Block diagnosis, medication, dismissive language
3. **Risk logging**: All flagged interactions → `risk-log.jsonl`

```python
# In reasoning-service/app/main.py
pre_result = guardrails.pre_check(user_input)
if pre_result["needsTemplate"]:
    response = get_crisis_template(locale)
else:
    response = reasoner.generate(messages)
    post_result = guardrails.post_check(response)
    if not post_result["isSafe"]:
        response = "I'm here to listen. How can I support you today?"
```

---

## Frontend Phase Detection

The frontend can detect which phase is active via timing:

```typescript
// If STT timing > 2000ms consistently, likely Phase B (local)
if (transcriptResponse.timing_ms > 2000) {
  console.log("Detected Phase B (local STT)");
}

// Show provider badge (optional)
<Badge>Phase {isPhaseB ? "B (Local)" : "A (API)"}</Badge>
```

---

## Deployment Checklist

### Phase A (Production)
- [ ] Obtain Groq API key
- [ ] Set up Google Cloud TTS credentials
- [ ] Configure `.env` files with API keys
- [ ] Set `STT_PROVIDER=api`, `TTS_PROVIDER=api`, `REASONER=server`
- [ ] Test E2E flow with 20 Tamil utterances
- [ ] Verify latency ≤10s typical

### Phase B (Privacy Mode)
- [ ] Build whisper.cpp with Tiny/Base model
- [ ] Test system TTS (macOS `say`, iOS AVSpeech, Android TTS)
- [ ] Install MLC-LLM with 1-3B quantized model
- [ ] Update `.env` to `STT_PROVIDER=local`, `TTS_PROVIDER=local`, `REASONER=local`
- [ ] Test E2E flow (expect 6-13s on CPU, 2-4s on GPU)
- [ ] Measure accuracy vs Phase A

---

## Troubleshooting

### "STT provider 'local' not available"
→ Implement `LocalSTTProvider.transcribe()` in `stt_provider.py`

### "TTS audio URL broken"
→ Ensure `LocalTTSProvider.synthesize()` returns valid audio bytes and saves to `audio_cache/`

### "Local LLM too slow"
→ Use GPU (g5.xlarge on AWS) or switch to smaller model (Phi-3-mini 1B)

### "Tamil not recognized"
→ Set `-l ta` flag in whisper.cpp, or use `ta-IN` locale in system TTS

---

## Next Steps

1. **Baseline Phase A**: Collect 20 Tamil utterances, measure E2E latency
2. **Implement Phase B**: Build whisper.cpp, integrate MLC-LLM
3. **Compare**: Run same 20 utterances in Phase B, compare quality & speed
4. **Optimize**: Use GPU, smaller models, caching for Phase B
5. **Document**: Add provider-specific notes to `STATUS.md`

---

## Resources

- **whisper.cpp**: https://github.com/ggerganov/whisper.cpp
- **MLC-LLM**: https://llm.mlc.ai/docs/
- **Google TTS**: https://cloud.google.com/text-to-speech/docs/voices
- **iOS AVSpeech**: https://developer.apple.com/documentation/avfoundation/avspeechsynthesizer
- **Android TTS**: https://developer.android.com/reference/android/speech/tts/TextToSpeech
