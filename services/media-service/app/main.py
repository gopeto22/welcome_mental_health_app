from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import aiofiles
from pathlib import Path
from datetime import datetime
import logging
import json
from typing import Optional

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Media Service", version="1.0.0")

# CORS - allow frontend on multiple ports for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8081",
        "http://localhost:8082",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directory for audio chunks
CHUNKS_DIR = Path("./audio_chunks")
CHUNKS_DIR.mkdir(exist_ok=True)

SPEECH_SERVICE_URL = "http://localhost:8002"


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "media-service",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.post("/media/chunk-upload")
async def upload_chunk(
    session_id: str = Query(..., description="Session ID"),
    sequence_index: int = Query(..., description="Chunk sequence number"),
    file: UploadFile = File(...)
):
    """
    Upload audio chunk and forward to speech service for STT.
    Audio stays on device - this service only coordinates.
    """
    start_time = datetime.utcnow()
    
    try:
        # Validate file type
        if not file.content_type or not any(
            fmt in file.content_type for fmt in ['audio', 'webm', 'opus', 'wav']
        ):
            logger.warning(f"Invalid content type: {file.content_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio format. Got: {file.content_type}"
            )
        
        # Save chunk temporarily (will be deleted after processing)
        session_dir = CHUNKS_DIR / session_id
        session_dir.mkdir(exist_ok=True)
        
        chunk_path = session_dir / f"chunk_{sequence_index:04d}.webm"
        
        # Write file
        async with aiofiles.open(chunk_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        file_size = len(content)
        
        logger.info(
            f"Chunk uploaded",
            extra={
                "session_id": session_id,
                "sequence_index": sequence_index,
                "file_size": file_size,
                "content_type": file.content_type
            }
        )
        
        # Forward to speech service for STT
        stt_result = None
        try:
            async with httpx.AsyncClient() as client:
                with open(chunk_path, 'rb') as audio_file:
                    response = await client.post(
                        f"{SPEECH_SERVICE_URL}/stt/chunk",
                        files={"file": (chunk_path.name, audio_file, file.content_type)},
                        timeout=30.0
                    )
                    response.raise_for_status()
                    stt_result = response.json()
        except httpx.HTTPError as e:
            logger.error(f"STT service error: {e}")
            # Continue without transcription
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        
        response_data = {
            "session_id": session_id,
            "sequence_index": sequence_index,
            "status": "uploaded",
            "file_size": file_size,
            "partial_text": stt_result.get("text") if stt_result else None,
            "final_text": stt_result.get("text") if stt_result and stt_result.get("is_final") else None,
            "language": stt_result.get("language") if stt_result else None,
            "processing_time_ms": int(elapsed * 1000)
        }
        
        # Clean up chunk file (audio doesn't persist)
        chunk_path.unlink(missing_ok=True)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chunk upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.on_event("shutdown")
async def cleanup():
    """Cleanup on shutdown"""
    logger.info("Media service shutting down")
