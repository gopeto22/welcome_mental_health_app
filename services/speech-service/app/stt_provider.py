"""
STT Provider abstraction for Phase A (API) and Phase B (local)
"""
from abc import ABC, abstractmethod
import os
from groq import Groq
import tempfile
from pathlib import Path


class STTProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_data: bytes, language: str = "ta") -> dict:
        """
        Transcribe audio to text.
        
        Returns:
            {
                "text": str,
                "language": str,
                "is_final": bool,
                "segments": [{"start": float, "end": float, "text": str}]
            }
        """
        pass


class GroqSTTProvider(STTProvider):
    """Phase A: Groq Whisper large-v3-turbo API"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment")
        self.client = Groq(api_key=api_key)
    
    async def transcribe(self, audio_data: bytes, language: str = "ta") -> dict:
        # Save to temp file (Groq API requires file path)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(audio_data)
            tmp_path = tmp.name
        
        try:
            # Use Groq Whisper API
            with open(tmp_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    file=(Path(tmp_path).name, audio_file.read()),
                    model="whisper-large-v3-turbo",
                    language=language,
                    response_format="verbose_json"
                )
            
            # Extract text and segments
            text = transcription.text or ""
            segments = []
            
            if hasattr(transcription, 'segments') and transcription.segments:
                segments = [
                    {
                        "start": seg.get("start", 0),
                        "end": seg.get("end", 0),
                        "text": seg.get("text", "")
                    }
                    for seg in transcription.segments
                ]
            
            return {
                "text": text,
                "language": language,
                "is_final": False,  # Streaming context - can be updated
                "segments": segments
            }
        finally:
            # Clean up temp file
            Path(tmp_path).unlink(missing_ok=True)


class LocalSTTProvider(STTProvider):
    """Phase B: Local Whisper via whisper.cpp or WhisperKit"""
    
    def __init__(self):
        model_path = os.getenv("WHISPER_MODEL_PATH")
        if not model_path:
            raise ValueError("WHISPER_MODEL_PATH not set for local STT")
        # TODO: Initialize local whisper model
        raise NotImplementedError("Phase B: Local STT not yet implemented")
    
    async def transcribe(self, audio_data: bytes, language: str = "ta") -> dict:
        # TODO: Run local whisper inference
        raise NotImplementedError("Phase B: Local STT not yet implemented")


def get_stt_provider() -> STTProvider:
    """Factory function to get configured STT provider"""
    provider_type = os.getenv("STT_PROVIDER", "api")
    
    if provider_type == "api":
        return GroqSTTProvider()
    elif provider_type == "local":
        return LocalSTTProvider()
    else:
        raise ValueError(f"Unknown STT_PROVIDER: {provider_type}")
