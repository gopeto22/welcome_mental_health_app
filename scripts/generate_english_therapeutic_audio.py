"""
English Therapeutic TTS Audio Generation Script

Generates HIGH-QUALITY English audio samples for clinician validation.
Uses premium Wavenet and Neural2 voices for natural, professional sound.

Requirements:
- Google Cloud TTS API access (project: tamil-tts-dev)
- GOOGLE_APPLICATION_CREDENTIALS environment variable set

Usage:
    python scripts/generate_english_therapeutic_audio.py
    
Output:
    assets/audio_therapeutic_test_english/
        ├── index.json (metadata for all samples)
        ├── rating_template.csv (for clinician evaluation)
        ├── phrase_01_breathing_wavenet_c_speed_0.8_pitch_-2.0.mp3
        ├── ...
        └── phrase_05_presence_neural2_f_speed_1.0_pitch_2.0.mp3
"""
import json
import os
from pathlib import Path
from google.cloud import texttospeech

# Therapeutic phrases for clinician validation (English)
THERAPEUTIC_PHRASES = [
    {
        "id": "phrase_01_breathing",
        "english": "Take a slow, deep breath.",
        "purpose": "breathing_guidance",
        "context": "Guiding patient through anxiety reduction technique",
    },
    {
        "id": "phrase_02_safety",
        "english": "You are safe now.",
        "purpose": "reassurance",
        "context": "Providing safety reassurance during distress",
    },
    {
        "id": "phrase_03_focus",
        "english": "Focus on your breathing.",
        "purpose": "grounding",
        "context": "Redirecting attention to grounding technique",
    },
    {
        "id": "phrase_04_validation",
        "english": "It's okay to feel anxious.",
        "purpose": "normalization",
        "context": "Validating patient's emotional experience",
    },
    {
        "id": "phrase_05_presence",
        "english": "I'm here with you.",
        "purpose": "therapeutic_presence",
        "context": "Establishing therapeutic alliance and presence",
    },
]

# HIGH-QUALITY British English voices (most natural sounding)
VOICE_CONFIGS = [
    {
        "name": "en-GB-Wavenet-C",
        "type": "Wavenet",
        "gender": texttospeech.SsmlVoiceGender.FEMALE,
        "description": "Female, warm and clear - Premium quality",
    },
    {
        "name": "en-GB-Wavenet-B",
        "type": "Wavenet", 
        "gender": texttospeech.SsmlVoiceGender.MALE,
        "description": "Male, professional and calm - Premium quality",
    },
    {
        "name": "en-GB-Neural2-F",
        "type": "Neural2",
        "gender": texttospeech.SsmlVoiceGender.FEMALE,
        "description": "Female, natural and empathetic - Latest technology",
    },
    {
        "name": "en-GB-Neural2-D",
        "type": "Neural2",
        "gender": texttospeech.SsmlVoiceGender.MALE,
        "description": "Male, reassuring and clear - Latest technology",
    },
]

# Speaking rates to test (therapeutic context)
SPEAKING_RATES = [
    {"rate": 0.85, "label": "slow_therapeutic", "description": "Slow, very calming pace for high anxiety"},
    {"rate": 0.95, "label": "moderate_calm", "description": "Moderate pace, balanced and professional"},
    {"rate": 1.0, "label": "normal", "description": "Natural conversational pace"},
]

# Pitch variations to test (semitones)
PITCH_VARIATIONS = [
    {"pitch": -2.0, "label": "lower_soothing", "description": "Lower pitch, more soothing and grounding"},
    {"pitch": 0.0, "label": "neutral", "description": "Natural pitch, professional tone"},
    {"pitch": +1.5, "label": "warmer", "description": "Slightly higher, warmer and more empathetic"},
]

# Output directory
OUTPUT_DIR = Path("assets/audio_therapeutic_test_english")


def generate_english_audio_samples():
    """
    Generate English therapeutic audio samples for clinician validation.
    
    Uses premium Wavenet and Neural2 voices for most natural sound.
    Total samples: 5 phrases × 4 voices × 3 speeds × 3 pitches = 180 MP3 files
    """
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize Google Cloud TTS client
    client = texttospeech.TextToSpeechClient()
    
    # Metadata for all generated samples
    sample_metadata = []
    
    total_samples = len(THERAPEUTIC_PHRASES) * len(VOICE_CONFIGS) * len(SPEAKING_RATES) * len(PITCH_VARIATIONS)
    
    print("🎙️  Generating ENGLISH therapeutic audio samples for clinician validation...")
    print(f"   Output: {OUTPUT_DIR}/")
    print(f"   Total samples: {total_samples}")
    print(f"   Voices: 4 premium voices (Wavenet + Neural2)")
    print()
    
    sample_count = 0
    
    for phrase in THERAPEUTIC_PHRASES:
        print(f"📝 Phrase: {phrase['id']}")
        print(f"   English: \"{phrase['english']}\"")
        print(f"   Context: {phrase['context']}")
        
        for voice in VOICE_CONFIGS:
            for speed in SPEAKING_RATES:
                for pitch in PITCH_VARIATIONS:
                    sample_count += 1
                    
                    # Build filename (cleaner format)
                    voice_short = voice["name"].replace("en-GB-", "").replace("-", "_").lower()
                    pitch_label = f"pitch_{pitch['pitch']:+.1f}".replace('+', 'pos').replace('-', 'neg').replace('.', '_')
                    filename = f"{phrase['id']}_{voice_short}_speed_{speed['rate']}_{pitch_label}.mp3"
                    filepath = OUTPUT_DIR / filename
                    
                    # Configure synthesis request
                    synthesis_input = texttospeech.SynthesisInput(text=phrase["english"])
                    
                    voice_params = texttospeech.VoiceSelectionParams(
                        language_code="en-GB",
                        name=voice["name"],
                        ssml_gender=voice["gender"],
                    )
                    
                    audio_config = texttospeech.AudioConfig(
                        audio_encoding=texttospeech.AudioEncoding.MP3,
                        speaking_rate=speed["rate"],
                        pitch=pitch["pitch"],
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
                            "purpose": phrase["purpose"],
                            "context": phrase["context"],
                            "voice": voice["name"],
                            "voice_type": voice["type"],
                            "voice_gender": "Female" if voice["gender"] == texttospeech.SsmlVoiceGender.FEMALE else "Male",
                            "voice_description": voice["description"],
                            "speaking_rate": speed["rate"],
                            "speaking_label": speed["label"],
                            "speaking_description": speed["description"],
                            "pitch": pitch["pitch"],
                            "pitch_label": pitch["label"],
                            "pitch_description": pitch["description"],
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
                "description": "English therapeutic audio samples for clinician validation",
                "language": "en-GB (British English)",
                "total_samples": len(sample_metadata),
                "phrase_count": len(THERAPEUTIC_PHRASES),
                "voice_count": len(VOICE_CONFIGS),
                "speed_count": len(SPEAKING_RATES),
                "pitch_count": len(PITCH_VARIATIONS),
                "voices": [
                    {
                        "name": v["name"],
                        "type": v["type"],
                        "gender": "Female" if v["gender"] == texttospeech.SsmlVoiceGender.FEMALE else "Male",
                        "description": v["description"],
                    }
                    for v in VOICE_CONFIGS
                ],
                "speaking_rates": [
                    {"rate": s["rate"], "label": s["label"], "description": s["description"]}
                    for s in SPEAKING_RATES
                ],
                "pitch_variations": [
                    {"pitch": p["pitch"], "label": p["label"], "description": p["description"]}
                    for p in PITCH_VARIATIONS
                ],
                "samples": sample_metadata,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    
    print()
    print(f"✅ Generated {len(sample_metadata)} English audio samples")
    print(f"📊 Metadata saved to {index_path}")
    print()
    print("🩺 Clinician Validation Instructions:")
    print("   1. Listen to samples with FFT clinicians")
    print("   2. Evaluate on:")
    print("      - Professional appropriateness (1-5)")
    print("      - Therapeutic tone (1-5)")
    print("      - Clarity and naturalness (1-5)")
    print("      - Suitability for trauma survivors (1-5)")
    print("   3. Select best voice/speed/pitch configuration")
    print("   4. Use same parameters for Tamil version")


def create_clinician_evaluation_template():
    """
    Generate evaluation template for clinician feedback.
    """
    survey_path = OUTPUT_DIR / "clinician_evaluation_template.csv"
    
    with open(survey_path, "w", encoding="utf-8") as f:
        f.write("filename,voice_type,gender,speed,pitch,professional_tone_1_5,therapeutic_quality_1_5,naturalness_1_5,trauma_appropriate_1_5,overall_preference_1_5,comments\n")
        
        # Add rows for each audio sample
        for phrase in THERAPEUTIC_PHRASES:
            for voice in VOICE_CONFIGS:
                for speed in SPEAKING_RATES:
                    for pitch in PITCH_VARIATIONS:
                        voice_short = voice["name"].replace("en-GB-", "").replace("-", "_").lower()
                        pitch_label = f"pitch_{pitch['pitch']:+.1f}".replace('+', 'pos').replace('-', 'neg').replace('.', '_')
                        filename = f"{phrase['id']}_{voice_short}_speed_{speed['rate']}_{pitch_label}.mp3"
                        
                        gender = "F" if voice["gender"] == texttospeech.SsmlVoiceGender.FEMALE else "M"
                        f.write(f"{filename},{voice['type']},{gender},{speed['rate']},{pitch['pitch']},,,,,,,\n")
    
    print(f"📋 Clinician evaluation template: {survey_path}")


if __name__ == "__main__":
    # Check for Google Cloud credentials
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("❌ Error: GOOGLE_APPLICATION_CREDENTIALS not set")
        print("   Please set the environment variable pointing to your service account key:")
        print("   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json")
        exit(1)
    
    generate_english_audio_samples()
    create_clinician_evaluation_template()
    
    print()
    print("═══════════════════════════════════════════════════════════")
    print("  ✅ READY FOR CLINICIAN VALIDATION")
    print("═══════════════════════════════════════════════════════════")
    print()
    print("Next steps:")
    print("1. Share samples with FFT clinicians")
    print("2. Collect feedback using clinician_evaluation_template.csv")
    print("3. Analyze ratings to select optimal configuration")
    print("4. Apply same voice parameters to Tamil samples")
    print()
