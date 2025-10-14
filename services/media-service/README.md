# Media Service

Handles audio chunk uploads and coordinates with speech service for transcription.

## Port

`:8001`

## Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "media-service",
  "timestamp": "2025-10-13T10:30:00Z"
}
```

### `POST /media/chunk-upload`
Upload audio chunk for processing.

**Query Parameters:**
- `session_id` (string, required): Unique session identifier
- `sequence_index` (int, required): Chunk sequence number (0, 1, 2, ...)

**Body:**
- Binary audio data (multipart/form-data)
- Supported formats: webm, opus, wav

**Response:**
```json
{
  "session_id": "session_1234",
  "sequence_index": 0,
  "status": "uploaded",
  "partial_text": "வணக்கம்",
  "final_text": null
}
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

## Environment Variables

None required for basic operation. Speech service coordination happens via HTTP.

## Testing

```bash
pytest tests/
```
