from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
import logging
import os
from pathlib import Path
import hashlib
from typing import Optional, Literal

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)
from .stt_provider import STTProvider, get_stt_provider
from .tts_provider import TTSProvider, get_tts_provider

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Speech Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audio cache directory
AUDIO_CACHE_DIR = Path("./audio_cache")
AUDIO_CACHE_DIR.mkdir(exist_ok=True)

# Initialize providers
stt_provider: Optional[STTProvider] = None
tts_provider: Optional[TTSProvider] = None


@app.on_event("startup")
async def startup():
    global stt_provider, tts_provider
    stt_provider = get_stt_provider()
    tts_provider = get_tts_provider()
    logger.info(f"Speech service started with STT={type(stt_provider).__name__}, TTS={type(tts_provider).__name__}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "speech-service",
        "stt_provider": os.getenv("STT_PROVIDER", "api"),
        "tts_provider": os.getenv("TTS_PROVIDER", "api"),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


class STTResponse(BaseModel):
    text: str
    language: str
    is_final: bool
    segments: list[dict] = []


@app.post("/stt/chunk", response_model=STTResponse)
async def transcribe_chunk(file: UploadFile = File(...)):
    """
    Transcribe audio chunk to Tamil text.
    Returns partial transcription (can be updated with next chunks).
    """
    start_time = datetime.utcnow()
    
    try:
        if not stt_provider:
            raise HTTPException(status_code=503, detail="STT provider not initialized")
        
        # Read audio data
        audio_data = await file.read()
        
        logger.info(f"Transcribing chunk: {len(audio_data)} bytes")
        
        # Get transcription
        result = await stt_provider.transcribe(audio_data, language="ta")
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        
        logger.info(
            f"STT completed",
            extra={
                "text_length": len(result["text"]),
                "language": result["language"],
                "processing_time_ms": int(elapsed * 1000)
            }
        )
        
        return STTResponse(
            text=result["text"],
            language=result["language"],
            is_final=result.get("is_final", False),
            segments=result.get("segments", [])
        )
        
    except Exception as e:
        logger.error(f"STT failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


class TTSRequest(BaseModel):
    text: str
    voice: str = "ta-IN"


class TTSResponse(BaseModel):
    file_url: str
    duration_ms: int
    cached: bool


@app.post("/tts/speak", response_model=TTSResponse)
async def generate_speech(request: TTSRequest):
    """
    Generate Tamil speech from text.
    Results are cached by (text, voice) hash.
    """
    start_time = datetime.utcnow()
    
    try:
        if not tts_provider:
            raise HTTPException(status_code=503, detail="TTS provider not initialized")
        
        # Check cache
        cache_key = hashlib.sha256(
            f"{request.text}:{request.voice}".encode()
        ).hexdigest()[:16]
        cache_path = AUDIO_CACHE_DIR / f"{cache_key}.mp3"
        
        cached = cache_path.exists()
        
        if not cached:
            logger.info(f"Generating TTS for text length: {len(request.text)}")
            
            # Generate audio
            audio_data = await tts_provider.synthesize(request.text, voice=request.voice)
            
            # Save to cache
            with open(cache_path, 'wb') as f:
                f.write(audio_data)
        else:
            logger.info(f"Using cached TTS: {cache_key}")
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        
        # Estimate duration (rough approximation)
        duration_ms = len(request.text) * 100  # ~100ms per character
        
        return TTSResponse(
            file_url=f"/audio/cache/{cache_key}.mp3",
            duration_ms=duration_ms,
            cached=cached
        )
        
    except Exception as e:
        logger.error(f"TTS failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@app.get("/audio/cache/{filename}")
async def serve_audio(filename: str):
    """Serve cached audio file"""
    file_path = AUDIO_CACHE_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=86400"}
    )
