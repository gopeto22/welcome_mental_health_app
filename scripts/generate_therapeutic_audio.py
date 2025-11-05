"""
Therapeutic TTS Audio Generation Script

Generates audio samples for focus group voice parameter testing.
Produces 60 audio files (5 phrases × 2 voices × 3 speeds × 2 pitches) for evaluating
which voice settings provide the most calming therapeutic experience.

Requirements:
- Google Cloud TTS API access (project: tamil-tts-dev)
- GOOGLE_APPLICATION_CREDENTIALS environment variable set

Usage:
    python scripts/generate_therapeutic_audio.py
    
Output:
    assets/audio_therapeutic_test/
        ├── index.json (metadata for all samples)
        ├── rating_template.csv (for focus group data collection)
        ├── phrase_01_breathing_standard_speed_0.8_pitch_-2.0.mp3
        ├── phrase_01_breathing_standard_speed_0.8_pitch_0.0.mp3
        ├── ...
        └── phrase_05_presence_wavenet_speed_1.0_pitch_2.0.mp3
"""
import json
import os
from pathlib import Path
from google.cloud import texttospeech

# Therapeutic phrases for testing (English + Tamil)
THERAPEUTIC_PHRASES = [
    {
        "id": "phrase_01_breathing",
        "english": "Take a slow, deep breath.",
        "tamil": "ஒரு மெதுவான ஆழ்ந்த மூச்சை எடுக்கவும்.",
        "purpose": "breathing_guidance",
    },
    {
        "id": "phrase_02_safety",
        "english": "You are safe now.",
        "tamil": "இப்போது நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.",
        "purpose": "reassurance",
    },
    {
        "id": "phrase_03_focus",
        "english": "Focus on your breathing.",
        "tamil": "உங்கள் மூச்சுக்கு கவனம் செலுத்துங்கள்.",
        "purpose": "grounding",
    },
    {
        "id": "phrase_04_validation",
        "english": "It's okay to feel anxious.",
        "tamil": "பதட்டமாக உணர்பது சரி.",
        "purpose": "normalization",
    },
    {
        "id": "phrase_05_presence",
        "english": "I'm here with you.",
        "tamil": "நான் உங்களுடன் இருக்கிறேன்.",
        "purpose": "therapeutic_presence",
    },
]

# Voice configurations to test
VOICE_CONFIGS = [
    {
        "name": "ta-IN-Standard-A",
        "type": "Standard",
        "gender": texttospeech.SsmlVoiceGender.FEMALE,
    },
    {
        "name": "ta-IN-Wavenet-A",
        "type": "Wavenet",
        "gender": texttospeech.SsmlVoiceGender.FEMALE,
    },
]

# Speaking rates to test (lower = calmer, slower)
SPEAKING_RATES = [
    {"rate": 0.8, "label": "slow_calming"},
    {"rate": 0.9, "label": "moderate"},
    {"rate": 1.0, "label": "normal"},
]

# Pitch variations to test (semitones)
PITCH_VARIATIONS = [
    {"pitch": -2.0, "label": "lower_calm"},
    {"pitch": 0.0, "label": "neutral"},
    {"pitch": +2.0, "label": "higher_bright"},
]

# Output directory
OUTPUT_DIR = Path("assets/audio_therapeutic_test")


def generate_audio_samples():
    """
    Generate all therapeutic audio samples for voice parameter testing.
    
    Total samples: 5 phrases × 2 voices × 3 speeds × 2 pitches = 60 MP3 files
    """
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize Google Cloud TTS client
    client = texttospeech.TextToSpeechClient()
    
    # Metadata for all generated samples
    sample_metadata = []
    
    total_samples = len(THERAPEUTIC_PHRASES) * len(VOICE_CONFIGS) * len(SPEAKING_RATES) * len(PITCH_VARIATIONS)
    
    print("🎙️  Generating therapeutic audio samples...")
    print(f"   Output: {OUTPUT_DIR}/")
    print(f"   Total samples: {total_samples}")
    print()
    
    sample_count = 0
    
    for phrase in THERAPEUTIC_PHRASES:
        print(f"📝 Phrase: {phrase['id']}")
        print(f"   Tamil: {phrase['tamil']}")
        
        for voice in VOICE_CONFIGS:
            for speed in SPEAKING_RATES:
                for pitch in PITCH_VARIATIONS:
                    sample_count += 1
                    
                    # Build filename
                    voice_short = voice["name"].split("-")[-1].lower()  # "standard-a" or "wavenet-a"
                    pitch_label = f"pitch_{pitch['pitch']:+.1f}".replace('+', 'pos').replace('-', 'neg')
                    filename = f"{phrase['id']}_{voice_short}_speed_{speed['rate']}_{pitch_label}.mp3"
                    filepath = OUTPUT_DIR / filename
                    
                    # Configure synthesis request
                    synthesis_input = texttospeech.SynthesisInput(text=phrase["tamil"])
                    
                    voice_params = texttospeech.VoiceSelectionParams(
                        language_code="ta-IN",
                        name=voice["name"],
                        ssml_gender=voice["gender"],
                    )
                    
                    audio_config = texttospeech.AudioConfig(
                        audio_encoding=texttospeech.AudioEncoding.MP3,
                        speaking_rate=speed["rate"],
                        pitch=pitch["pitch"],  # ✅ NEW: Pitch variation
                    )
                    
                    # Generate audio
                    try:
                        response = client.synthesize_speech(
                            input=synthesis_input,
                            voice=voice_params,
                            audio_config=audio_config,
                        )
                        
                        # Write to file
                        with open(filepath, "wb") as out:
                            out.write(response.audio_content)
                        
                        # Calculate audio duration (approximate from byte size)
                        audio_bytes = len(response.audio_content)
                        estimated_duration = audio_bytes / 16000  # Rough estimate for MP3
                        
                        # Store metadata
                        sample_metadata.append({
                            "filename": filename,
                            "phrase_id": phrase["id"],
                            "english": phrase["english"],
                            "tamil": phrase["tamil"],
                            "purpose": phrase["purpose"],
                            "voice": voice["name"],
                            "voice_type": voice["type"],
                            "speaking_rate": speed["rate"],
                            "speaking_label": speed["label"],
                            "pitch": pitch["pitch"],
                            "pitch_label": pitch["label"],
                            "audio_bytes": audio_bytes,
                            "estimated_duration_sec": round(estimated_duration, 2),
                        })
                        
                        print(f"   [{sample_count}/{total_samples}] ✅ {filename}")
                        
                    except Exception as e:
                        print(f"   ❌ Failed to generate {filename}: {e}")
    
    # Write metadata index
    index_path = OUTPUT_DIR / "index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "description": "Therapeutic audio samples for voice parameter testing",
                "total_samples": len(sample_metadata),
                "phrase_count": len(THERAPEUTIC_PHRASES),
                "voice_count": len(VOICE_CONFIGS),
                "speed_count": len(SPEAKING_RATES),
                "pitch_count": len(PITCH_VARIATIONS),
                "voices": [v["name"] for v in VOICE_CONFIGS],
                "speaking_rates": [s["rate"] for s in SPEAKING_RATES],
                "pitch_variations": [p["pitch"] for p in PITCH_VARIATIONS],
                "samples": sample_metadata,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    
    print()
    print(f"✅ Generated {len(sample_metadata)} audio samples")
    print(f"📊 Metadata saved to {index_path}")
    print()
    print("🧪 Next steps:")
    print("   1. Conduct focus group testing with target users")
    print("   2. Rate each sample on:")
    print("      - Naturalness (1-5)")
    print("      - Calmness (1-5)")
    print("      - Clarity (1-5)")
    print("      - Overall preference (1-5)")
    print("   3. Analyze ratings to select optimal voice parameters")
    print("   4. Update TTS config with preferred voice/speed")


def create_focus_group_survey():
    """
    Generate a simple rating template for focus group testing.
    """
    survey_path = OUTPUT_DIR / "focus_group_rating_template.csv"
    
    with open(survey_path, "w", encoding="utf-8") as f:
        f.write("filename,naturalness_1_5,calmness_1_5,clarity_1_5,preference_1_5,comments\n")
        
        # Add rows for each audio sample
        for phrase in THERAPEUTIC_PHRASES:
            for voice in VOICE_CONFIGS:
                for speed in SPEAKING_RATES:
                    voice_short = voice["name"].split("-")[-1].lower()
                    filename = f"{phrase['id']}_{voice_short}_speed_{speed['rate']}.mp3"
                    f.write(f"{filename},,,,,\n")
    
    print(f"📋 Focus group rating template: {survey_path}")


if __name__ == "__main__":
    # Check for Google Cloud credentials
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("❌ Error: GOOGLE_APPLICATION_CREDENTIALS not set")
        print("   Please set the environment variable pointing to your service account key:")
        print("   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json")
        exit(1)
    
    generate_audio_samples()
    create_focus_group_survey()
