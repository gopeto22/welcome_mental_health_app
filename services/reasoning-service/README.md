# Reasoning Service

LLM-powered response generation with safety guardrails for mental health support.

## Port

`:8003`

## Configuration

### Phase A (API-based - Current)
- **LLM**: Groq Llama-3.3-70B

### Phase B (On-device - Future)
- **LLM**: Quantized 1-3B local model via MLC-LLM or llama.cpp

## Endpoints

### `GET /health`
Health check endpoint.

### `POST /respond`
Generate safe, supportive response to user input.

**Body:**
```json
{
  "session_id": "session_1234",
  "transcript_window": ["வணக்கம்", "நான் மிகவும் கவலையாக உணர்கிறேன்"],
  "locale": "ta-IN"
}
```

**Response:**
```json
{
  "reply_text": "உங்கள் உணர்வுகளைப் பகிர்ந்து கொண்டதற்கு நன்றி...",
  "risk_flags": {
    "has_self_harm": false,
    "has_medical_advice": false,
    "needs_escalation": false
  },
  "processing_time_ms": 1500
}
```

### `POST /events/risk`
Log risk event (crisis detection).

**Body:**
```json
{
  "session_id": "session_1234",
  "event_type": "self_harm_detected",
  "transcript_snippet": "...",
  "timestamp": "2025-10-13T10:30:00Z"
}
```

## Safety Guardrails

### Pre-check (Keyword/Rule Triage)
- Self-harm indicators
- Harm to others
- Dissociation/psychosis markers
- Medical emergency language

High-risk → Crisis template + event log

### Post-check (LLM Response Validation)
- Refuses diagnosis
- Refuses medication advice
- Ensures supportive, non-directive language
- Provides helpline info when needed

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys (Phase A only)
uvicorn app.main:app --reload --port 8003
```

## Environment Variables

**Phase A:**
```bash
REASONER=server
GROQ_API_KEY=gsk_...
```

**Phase B:**
```bash
REASONER=local
LOCAL_MODEL_PATH=/path/to/quantized-model.gguf
```

## Testing

```bash
pytest tests/
```
