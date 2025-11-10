#!/usr/bin/env python3
"""
Streamlit Demo App for Tamil Mind Mate
Reproduces mobile prototype core experience for clinician testing
"""

import streamlit as st
import requests
import json
from pathlib import Path
from datetime import datetime
import base64

# ============================================================================
# CONFIGURATION
# ============================================================================

# API Endpoints (using existing backend services)
SPEECH_SERVICE_URL = "http://localhost:8002"
REASONING_SERVICE_URL = "http://localhost:8003"

# Translations
TRANSLATIONS = {
    "en-GB": {
        "title": "Tamil Mind Mate",
        "subtitle": "Mental Health Support Assistant",
        "suds_label": "How distressed are you feeling right now?",
        "suds_scale": "0 = Not distressed at all | 10 = Extremely distressed",
        "start_session": "Start Session",
        "your_message": "Your message",
        "send": "Send",
        "exercises": "Grounding Exercises",
        "safety_plan": "Safety Plan",
        "exercise_breathing": "Paced Breathing",
        "exercise_focus": "5-4-3-2-1 Grounding",
        "exercise_general": "General Grounding",
        "play_exercise": "Play Exercise",
        "stop_exercise": "Stop Exercise",
        "feeling_better": "How are you feeling now?",
        "session_ended": "Session Ended",
        "restart": "Start New Session",
        "safety_step1_title": "Step 1: Talk to your safe person",
        "safety_step1_desc": "Contact someone you trust - a friend, family member, or support person who you've identified as helpful when you're struggling.",
        "safety_step2_title": "Step 2: NHS 111 - Mental Health Option",
        "safety_step2_desc": "Call NHS 111 and press option 2 for mental health support, or contact your GP for urgent help.",
        "safety_step3_title": "Step 3: Emergency Services",
        "safety_step3_desc": "If you're in immediate danger, call 999 or go to your nearest A&E department.",
        "try_exercise": "Try a grounding exercise",
    },
    "ta-IN": {
        "title": "தமிழ் மனம் தோழன்",
        "subtitle": "மனநல ஆதரவு உதவியாளர்",
        "suds_label": "நீங்கள் இப்போது எவ்வளவு கவலையாக உணர்கிறீர்கள்?",
        "suds_scale": "0 = கவலை இல்லை | 10 = மிகவும் அதிக கவலை",
        "start_session": "அமர்வைத் தொடங்கு",
        "your_message": "உங்கள் செய்தி",
        "send": "அனுப்பு",
        "exercises": "அமைதிப்படுத்தும் பயிற்சிகள்",
        "safety_plan": "பாதுகாப்பு திட்டம்",
        "exercise_breathing": "சுவாச பயிற்சி",
        "exercise_focus": "5-4-3-2-1 கவனம்",
        "exercise_general": "பொது அமைதி",
        "play_exercise": "பயிற்சியை இயக்கு",
        "stop_exercise": "பயிற்சியை நிறுத்து",
        "feeling_better": "இப்போது எப்படி உணர்கிறீர்கள்?",
        "session_ended": "அமர்வு முடிந்தது",
        "restart": "புதிய அமர்வைத் தொடங்கு",
        "safety_step1_title": "படி 1: உங்கள் பாதுகாப்பான நபரிடம் பேசுங்கள்",
        "safety_step1_desc": "நீங்கள் நம்பும் ஒருவரை தொடர்பு கொள்ளுங்கள் - ஒரு நண்பர், குடும்ப உறுப்பினர், அல்லது உதவி செய்யக்கூடிய ஒருவர்.",
        "safety_step2_title": "படி 2: NHS 111 - மனநல உதவி",
        "safety_step2_desc": "NHS 111 அழைத்து மனநல ஆதரவுக்கு விருப்பம் 2 ஐ அழுத்தவும், அல்லது அவசர உதவிக்கு உங்கள் மருத்துவரை தொடர்பு கொள்ளவும்.",
        "safety_step3_title": "படி 3: அவசர சேவைகள்",
        "safety_step3_desc": "உடனடி ஆபத்து இருந்தால், 999 அழைக்கவும் அல்லது அருகிலுள்ள A&E துறைக்கு செல்லவும்.",
        "try_exercise": "அமைதிப்படுத்தும் பயிற்சியை முயற்சிக்கவும்",
    }
}

EXERCISES = {
    "breathing": {
        "en-GB": {"name": "Paced Breathing", "duration": "2-3 minutes", "audio": "breathing_en.mp3"},
        "ta-IN": {"name": "சுவாச பயிற்சி", "duration": "2-3 நிமிடங்கள்", "audio": "breathing_ta.mp3"},
    },
    "focus": {
        "en-GB": {"name": "5-4-3-2-1 Grounding", "duration": "3-4 minutes", "audio": "focus_en.mp3"},
        "ta-IN": {"name": "5-4-3-2-1 கவனம்", "duration": "3-4 நிமிடங்கள்", "audio": "focus_ta.mp3"},
    },
    "general": {
        "en-GB": {"name": "General Grounding", "duration": "2-3 minutes", "audio": "general_en.mp3"},
        "ta-IN": {"name": "பொது அமைதி", "duration": "2-3 நிமிடங்கள்", "audio": "general_ta.mp3"},
    }
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def t(key: str) -> str:
    """Get translation for current locale"""
    locale = st.session_state.get("locale", "en-GB")
    return TRANSLATIONS.get(locale, TRANSLATIONS["en-GB"]).get(key, key)

def get_audio_path(exercise_key: str) -> Path:
    """Get path to exercise audio file"""
    locale = st.session_state.get("locale", "en-GB")
    audio_file = EXERCISES[exercise_key][locale]["audio"]
    audio_path = Path(__file__).parent.parent / "frontend" / "public" / "audio" / "exercises" / audio_file
    return audio_path

def get_audio_base64(audio_path: Path) -> str:
    """Convert audio file to base64 for embedding"""
    if audio_path.exists():
        with open(audio_path, "rb") as f:
            audio_bytes = f.read()
        return base64.b64encode(audio_bytes).decode()
    return None

def call_reasoning_api(user_input: str, conversation_history: list) -> dict:
    """Call reasoning service API"""
    locale = st.session_state.get("locale", "en-GB")
    session_id = st.session_state.get("session_id", "streamlit-demo")
    
    # Build transcript window with role prefixes (matches our fix from Nov 6)
    transcript_window = []
    for msg in conversation_history:
        transcript_window.append(f"{msg['role']}: {msg['text']}")
    transcript_window.append(f"user: {user_input}")
    
    try:
        response = requests.post(
            f"{REASONING_SERVICE_URL}/respond",
            json={
                "session_id": session_id,
                "locale": locale,
                "transcript_window": transcript_window,
                "mode": "chat"
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.error(f"API Error: {e}")
        return {
            "reply_text": "I'm having trouble connecting right now. Please try again.",
            "risk_flags": {"needs_escalation": False}
        }

def check_safety_trigger(suds: int) -> bool:
    """Check if safety plan should be triggered"""
    return suds >= 10

# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================

def init_session_state():
    """Initialize session state variables"""
    if "initialized" not in st.session_state:
        st.session_state.initialized = True
        st.session_state.locale = "en-GB"
        st.session_state.session_started = False
        st.session_state.suds_initial = 5
        st.session_state.messages = []
        st.session_state.session_id = f"streamlit-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        st.session_state.show_safety_plan = False
        st.session_state.playing_exercise = None

# ============================================================================
# UI COMPONENTS
# ============================================================================

def render_language_toggle():
    """Render language toggle in sidebar"""
    st.sidebar.title("Settings / அமைப்புகள்")
    
    current_locale = st.session_state.get("locale", "en-GB")
    language = st.sidebar.radio(
        "Language / மொழி",
        options=["en-GB", "ta-IN"],
        format_func=lambda x: "🇬🇧 English" if x == "en-GB" else "தமிழ்",
        index=0 if current_locale == "en-GB" else 1,
        key="language_selector"
    )
    
    if language != st.session_state.locale:
        st.session_state.locale = language
        st.rerun()

def render_suds_screen():
    """Render SUDS entry screen"""
    st.title(t("title"))
    st.caption(t("subtitle"))
    
    st.markdown("---")
    
    st.subheader(t("suds_label"))
    st.caption(t("suds_scale"))
    
    suds = st.slider(
        "SUDS",
        min_value=0,
        max_value=10,
        value=5,
        label_visibility="collapsed",
        key="suds_slider"
    )
    
    st.session_state.suds_initial = suds
    
    if st.button(t("start_session"), type="primary", use_container_width=True):
        st.session_state.session_started = True
        st.session_state.show_safety_plan = check_safety_trigger(suds)
        st.rerun()

def render_safety_plan():
    """Render UK 3-step safety plan"""
    st.title("🚨 " + t("safety_plan"))
    
    # Step 1: Safe Person (Blue)
    st.markdown("""
    <div style="border-left: 4px solid #3b82f6; padding: 16px; background-color: #eff6ff; border-radius: 8px; margin-bottom: 16px;">
        <h3 style="color: #1e40af; margin-top: 0;">""" + t("safety_step1_title") + """</h3>
        <p style="color: #1e3a8a;">""" + t("safety_step1_desc") + """</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 2: NHS 111 (Green)
    st.markdown("""
    <div style="border-left: 4px solid #10b981; padding: 16px; background-color: #ecfdf5; border-radius: 8px; margin-bottom: 16px;">
        <h3 style="color: #047857; margin-top: 0;">""" + t("safety_step2_title") + """</h3>
        <p style="color: #065f46;">""" + t("safety_step2_desc") + """</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 3: 999/A&E (Red)
    st.markdown("""
    <div style="border-left: 4px solid #ef4444; padding: 16px; background-color: #fef2f2; border-radius: 8px; margin-bottom: 16px;">
        <h3 style="color: #b91c1c; margin-top: 0;">""" + t("safety_step3_title") + """</h3>
        <p style="color: #991b1b;">""" + t("safety_step3_desc") + """</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    if st.button(t("try_exercise"), use_container_width=True):
        st.session_state.show_safety_plan = False
        st.rerun()

def render_chat_interface():
    """Render main chat interface"""
    st.title(t("title"))
    
    # Display conversation history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["text"])
    
    # Chat input
    user_input = st.chat_input(t("your_message"))
    
    if user_input:
        # Add user message
        st.session_state.messages.append({
            "role": "user",
            "text": user_input
        })
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(user_input)
        
        # Get AI response
        with st.spinner("Thinking..."):
            result = call_reasoning_api(user_input, st.session_state.messages[:-1])
        
        # Check if safety plan should trigger
        if result.get("risk_flags", {}).get("needs_escalation", False):
            st.session_state.show_safety_plan = True
            st.rerun()
        
        # Add assistant message
        assistant_msg = result.get("reply_text", "I'm here to help.")
        st.session_state.messages.append({
            "role": "assistant",
            "text": assistant_msg
        })
        
        # Display assistant message
        with st.chat_message("assistant"):
            st.markdown(assistant_msg)
        
        st.rerun()

def render_exercises_sidebar():
    """Render exercises panel in sidebar"""
    st.sidebar.markdown("---")
    st.sidebar.subheader(t("exercises"))
    
    locale = st.session_state.get("locale", "en-GB")
    
    for exercise_key, exercise_data in EXERCISES.items():
        exercise_info = exercise_data[locale]
        
        with st.sidebar.expander(exercise_info["name"]):
            st.caption(f"Duration: {exercise_info['duration']}")
            
            audio_path = get_audio_path(exercise_key)
            
            if audio_path.exists():
                # Use native audio player
                with open(audio_path, "rb") as audio_file:
                    audio_bytes = audio_file.read()
                st.audio(audio_bytes, format="audio/mp3")
            else:
                st.warning(f"Audio file not found: {audio_path.name}")

def render_session_info():
    """Render session info in sidebar"""
    st.sidebar.markdown("---")
    st.sidebar.caption(f"**Session ID:** {st.session_state.session_id}")
    st.sidebar.caption(f"**Initial SUDS:** {st.session_state.suds_initial}/10")
    st.sidebar.caption(f"**Messages:** {len(st.session_state.messages)}")
    
    if st.sidebar.button("End Session", type="secondary", use_container_width=True):
        st.session_state.clear()
        st.rerun()

# ============================================================================
# MAIN APP
# ============================================================================

def main():
    """Main app entry point"""
    
    # Page config
    st.set_page_config(
        page_title="Tamil Mind Mate - Demo",
        page_icon="🧠",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize session state
    init_session_state()
    
    # Render language toggle
    render_language_toggle()
    
    # Main content
    if not st.session_state.session_started:
        # SUDS entry screen
        render_suds_screen()
    elif st.session_state.show_safety_plan:
        # Safety plan
        render_safety_plan()
        render_exercises_sidebar()
        render_session_info()
    else:
        # Chat interface
        render_chat_interface()
        render_exercises_sidebar()
        render_session_info()

if __name__ == "__main__":
    main()
