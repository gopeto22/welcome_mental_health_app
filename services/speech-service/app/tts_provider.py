"""
TTS Provider abstraction for Phase A (API) and Phase B (local)
"""
from abc import ABC, abstractmethod
import os
from google.cloud import texttospeech


class TTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice: str = "ta-IN") -> bytes:
        """
        Synthesize speech from text.
        
        Returns:
            Audio data as bytes (MP3 format)
        """
        pass


class GoogleTTSProvider(TTSProvider):
    """Phase A: Google Cloud TTS with Tamil voice"""
    
    def __init__(self):
        # Set credentials path if provided
        creds_path = os.getenv("GOOGLE_TTS_CREDENTIALS_PATH")
        if creds_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
        
        self.client = texttospeech.TextToSpeechClient()
    
    async def synthesize(self, text: str, voice: str = "ta-IN") -> bytes:
        # Set up synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Voice configuration
        # Tamil (India) voices: ta-IN-Standard-A (female), ta-IN-Standard-B (male)
        # ta-IN-Wavenet-A, ta-IN-Wavenet-B (premium voices)
        
        # If voice is just language code (ta-IN), use default Standard-A
        if voice == "ta-IN":
            voice_name = "ta-IN-Standard-A"
        else:
            voice_name = voice  # Use the full voice name as provided
        
        voice_params = texttospeech.VoiceSelectionParams(
            language_code="ta-IN",
            name=voice_name,
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        # Audio configuration
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9,  # Slightly slower for clarity
            pitch=0.0
        )
        
        # Perform synthesis
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice_params,
            audio_config=audio_config
        )
        
        return response.audio_content


class LocalTTSProvider(TTSProvider):
    """Phase B: Local TTS via system or MMS-TTS"""
    
    def __init__(self):
        model_path = os.getenv("TTS_MODEL_PATH")
        # TODO: Initialize local TTS (system or MMS-TTS)
        raise NotImplementedError("Phase B: Local TTS not yet implemented")
    
    async def synthesize(self, text: str, voice: str = "ta-IN") -> bytes:
        # TODO: Run local TTS synthesis
        # Options:
        # 1. iOS: AVSpeechSynthesizer via bridge
        # 2. Android: TextToSpeech via bridge
        # 3. MMS-TTS model for Tamil
        raise NotImplementedError("Phase B: Local TTS not yet implemented")


def get_tts_provider() -> TTSProvider:
    """Factory function to get configured TTS provider"""
    provider_type = os.getenv("TTS_PROVIDER", "api")
    
    if provider_type == "api":
        return GoogleTTSProvider()
    elif provider_type == "local":
        return LocalTTSProvider()
    else:
        raise ValueError(f"Unknown TTS_PROVIDER: {provider_type}")
