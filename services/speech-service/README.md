# Speech Service

Provides Speech-to-Text (STT) and Text-to-Speech (TTS) for Tamil language.

## Port

`:8002`

## Configuration

### Phase A (API-based - Current)
- **STT**: Groq Whisper large-v3-turbo
- **TTS**: Google Cloud TTS (ta-IN)

### Phase B (On-device - Future)
- **STT**: Whisper Tiny/Base via whisper.cpp
- **TTS**: System TTS or MMS-TTS

## Endpoints

### `GET /health`
Health check endpoint.

### `POST /stt/chunk`
Transcribe audio chunk to text.

**Body:**
- `file`: Audio file (multipart/form-data)

**Response:**
```json
{
  "text": "வணக்கம் எப்படி இருக்கீங்க",
  "language": "ta",
  "is_final": false,
  "segments": [
    {"start": 0.0, "end": 1.2, "text": "வணக்கம்"},
    {"start": 1.2, "end": 2.5, "text": "எப்படி இருக்கீங்க"}
  ]
}
```

### `POST /tts/speak`
Generate Tamil speech from text.

**Body:**
```json
{
  "text": "நான் இங்கே உங்களுக்கு உதவ இருக்கிறேன்",
  "voice": "ta-IN"
}
```

**Response:**
```json
{
  "file_url": "/audio/cache/abc123.mp3",
  "duration_ms": 2500,
  "cached": false
}
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys (Phase A only)
uvicorn app.main:app --reload --port 8002
```

## Environment Variables

**Phase A:**
```bash
STT_PROVIDER=api
TTS_PROVIDER=api
GROQ_API_KEY=gsk_...
GOOGLE_TTS_CREDENTIALS_PATH=/path/to/credentials.json
```

**Phase B:**
```bash
STT_PROVIDER=local
TTS_PROVIDER=local
WHISPER_MODEL_PATH=/path/to/whisper-tiny-ta.bin
```

## Testing

```bash
pytest tests/
```
