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
    """Phase A: Google Cloud TTS with Tamil and English voices"""
    
    # Allowed voice names
    ALLOWED_VOICES = {
        # Tamil voices
        "ta-IN-Standard-A",  # Female standard
        "ta-IN-Standard-B",  # Male standard
        "ta-IN-Wavenet-A",   # Female premium
        "ta-IN-Wavenet-B",   # Male premium
        # English voices
        "en-GB-Wavenet-C",   # Female, warm and clear
        "en-GB-Wavenet-B",   # Male, professional
        "en-GB-Neural2-F",   # Female, natural and empathetic (PREFERRED)
        "en-GB-Neural2-D",   # Male, reassuring and clear
    }
    
    DEFAULT_VOICE = "ta-IN-Standard-A"
    DEFAULT_EN_VOICE = "en-GB-Neural2-F"
    
    def __init__(self):
        # Set credentials path if provided
        creds_path = os.getenv("GOOGLE_TTS_CREDENTIALS_PATH")
        if creds_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
        
        self.client = texttospeech.TextToSpeechClient()
    
    def _validate_voice(self, voice: str) -> tuple[str, str]:
        """
        Validate and normalize voice name.
        Returns (voice_name, language_code) tuple.
        """
        # If voice is just language code, use default
        if voice == "ta-IN" or not voice:
            return self.DEFAULT_VOICE, "ta-IN"
        
        if voice == "en-GB":
            return self.DEFAULT_EN_VOICE, "en-GB"
        
        # Check if voice is in allowed list
        if voice in self.ALLOWED_VOICES:
            # Extract language code from voice name
            lang_code = "-".join(voice.split("-")[:2])
            return voice, lang_code
        
        # Check if it's a language prefix we support
        if voice.startswith("ta-IN-") or voice.startswith("en-GB-"):
            # Might be malformed, log warning
            import logging
            logger = logging.getLogger(__name__)
            lang = "ta-IN" if voice.startswith("ta-IN") else "en-GB"
            default = self.DEFAULT_VOICE if lang == "ta-IN" else self.DEFAULT_EN_VOICE
            logger.warning(f"Voice '{voice}' not in allowed list. Using default: {default}")
            return default, lang
        
        # Otherwise use default
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Invalid voice '{voice}'. Using default: {self.DEFAULT_VOICE}")
        return self.DEFAULT_VOICE, "ta-IN"
    
    async def synthesize(
        self, 
        text: str, 
        voice: str = "ta-IN",
        speed: float = 1.0,
        pitch: float = 0.0
    ) -> bytes:
        # Set up synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Validate and get proper voice name and language
        voice_name, lang_code = self._validate_voice(voice)
        
        # Determine gender based on voice name
        # F-suffix or Female names = FEMALE, otherwise MALE
        if "-F" in voice_name or "-A" in voice_name or "-C" in voice_name:
            gender = texttospeech.SsmlVoiceGender.FEMALE
        else:
            gender = texttospeech.SsmlVoiceGender.MALE
        
        voice_params = texttospeech.VoiceSelectionParams(
            language_code=lang_code,
            name=voice_name,
            ssml_gender=gender
        )
        
        # Audio configuration with custom speed and pitch
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speed,  # Configurable speed
            pitch=pitch  # Configurable pitch (in semitones)
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
