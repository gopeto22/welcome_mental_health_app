# தமிழ் நிலைத்திறன் கைபிடி (Tamil Grounding Scripts) - MVP

## மல்டிசென்ஸரி கிரவுண்டிங் (Multisensory Grounding) - 3-2-1 Technique

**Duration:** 30-60 seconds  
**Purpose:** Help users ground themselves in the present moment using sight, touch, and sound

### Script (Tamil):

```
இப்போது ஒரு சிறிய நேரம் எடுத்துக்கொள்ளுங்கள், மெதுவாக மூச்சை உள்ளழுத்தவும், வெளிவிடவும். 

சுற்றியுள்ள சூழலை ஒரு பார்வை நோக்குங்கள். நீங்கள் பார்க்கக்கூடிய மூன்று பொருட்களை கவனமாக அடையாளம் காணுங்கள் – ஒவ்வொன்றின் நிறம், வடிவம் போன்ற விவரங்களை கவனியுங்கள். 

பிறகு, நீங்கள் தொடக்கூடிய இரண்டு பொருட்களை தொட்டு, அவற்றின் உருவமும் வெப்பநிலையும் உணருங்கள். 

பின்னர், உங்கள் சுற்றத்தில் நீங்கள் கேட்கக்கூடிய ஒரு ஒலியைக் கவனியுங்கள். 

இன்னும் ஒரு முறையாவது மெதுவாக மூச்சை இழுத்து விடுங்கள். 

நீங்கள் இப்போது இந்த தருணத்தில் பாதுகாப்பாக இருக்கிறீர்கள்.
```

### English Translation:

```
Now take a moment and breathe slowly in and out.

Look around your environment carefully. Notice three things you can see – observe details like their color or shape.

Next, touch two things near you and pay attention to their texture and temperature.

Then, focus on one sound you can hear in your surroundings.

Take another slow breath.

You are safe in this moment.
```

### Implementation Notes:

- **Voice Pacing:** Speak slowly and calmly (0.9x speed in TTS)
- **Pauses:** Include 2-3 second pauses between each section
- **Tone:** Gentle, reassuring, non-urgent
- **Audio File:** `assets/audio_protocols/grounding_multisensory_ta.mp3`

### Clinical Context:

This is a simplified 3-2-1 sensory grounding technique derived from the classic 5-4-3-2-1 exercise. It helps users:
- Interrupt anxious thought patterns
- Reconnect with the present moment
- Reduce dissociative symptoms
- Self-regulate during distress

### Usage in MVP:

- Triggered when user reports anxiety, panic, or dissociation
- Can be played via TTS or pre-recorded audio
- Should be accompanied by visual text on screen
- User can replay as needed

---

## Additional Grounding Techniques (Future Implementation)

### 1. மூச்சு பயிற்சி (Breathing Exercise) - Box Breathing
- 4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold
- Repeat 3-4 cycles

### 2. உடல் ஸ்கேன் (Body Scan) - Brief Version
- Progressive attention from head to toes
- Notice sensations without judgment
- 2-3 minutes duration

### 3. பெயரிடுதல் (Naming/Labeling)
- Name emotions as they arise
- "I notice I'm feeling..."
- Reduces emotional intensity through acknowledgment

---

## Safety Considerations:

- All scripts avoid triggering language
- No mention of trauma or crisis scenarios
- Focus on present moment, not past/future
- Clear, simple language (formal Tamil)
- Accessible to various literacy levels
- Can be delivered via text, audio, or both

---

**Version:** 1.0  
**Last Updated:** October 24, 2025  
**Clinical Review:** Pending
