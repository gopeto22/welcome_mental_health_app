#!/bin/bash

# Tamil Mind Mate - Streamlit Demo Setup Script
# Quick setup for clinician testing

set -e  # Exit on error

echo "🚀 Tamil Mind Mate - Streamlit Demo Setup"
echo "=========================================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo "✅ Python $PYTHON_VERSION found"
else
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check if in streamlit-demo directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Please run this script from the streamlit-demo directory."
    exit 1
fi

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv
echo "✅ Virtual environment created"

# Activate virtual environment
echo ""
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"

# Check backend services
echo ""
echo "🔍 Checking backend services..."

SPEECH_HEALTHY=false
REASONING_HEALTHY=false

if curl -s http://localhost:8002/health | grep -q "ok"; then
    echo "✅ Speech Service (port 8002): HEALTHY"
    SPEECH_HEALTHY=true
else
    echo "⚠️  Speech Service (port 8002): NOT RUNNING"
fi

if curl -s http://localhost:8003/health | grep -q "ok"; then
    echo "✅ Reasoning Service (port 8003): HEALTHY"
    REASONING_HEALTHY=true
else
    echo "⚠️  Reasoning Service (port 8003): NOT RUNNING"
fi

# Check audio files
echo ""
echo "🎵 Checking audio files..."
AUDIO_DIR="../frontend/public/audio/exercises"

if [ ! -d "$AUDIO_DIR" ]; then
    echo "⚠️  Audio directory not found: $AUDIO_DIR"
    AUDIO_FILES_OK=false
else
    AUDIO_FILES_OK=true
    EXPECTED_FILES=("breathing_en.mp3" "breathing_ta.mp3" "focus_en.mp3" "focus_ta.mp3" "general_en.mp3" "general_ta.mp3")
    
    for file in "${EXPECTED_FILES[@]}"; do
        if [ -f "$AUDIO_DIR/$file" ]; then
            echo "✅ $file"
        else
            echo "❌ $file (missing)"
            AUDIO_FILES_OK=false
        fi
    done
fi

# Summary
echo ""
echo "=========================================="
echo "📊 SETUP SUMMARY"
echo "=========================================="

if $SPEECH_HEALTHY && $REASONING_HEALTHY && $AUDIO_FILES_OK; then
    echo "✅ All systems ready!"
    echo ""
    echo "🚀 To start the app, run:"
    echo "   source venv/bin/activate"
    echo "   streamlit run app.py"
    echo ""
    echo "The app will open at: http://localhost:8501"
else
    echo "⚠️  Some components need attention:"
    echo ""
    
    if ! $SPEECH_HEALTHY || ! $REASONING_HEALTHY; then
        echo "🔧 Start backend services:"
        echo ""
        if ! $SPEECH_HEALTHY; then
            echo "   # Terminal 1: Speech Service"
            echo "   cd ../services/speech-service"
            echo "   source venv/bin/activate"
            echo "   uvicorn app.main:app --port 8002 --reload"
            echo ""
        fi
        if ! $REASONING_HEALTHY; then
            echo "   # Terminal 2: Reasoning Service"
            echo "   cd ../services/reasoning-service"
            echo "   source venv/bin/activate"
            echo "   uvicorn app.main:app --port 8003 --reload"
            echo ""
        fi
    fi
    
    if ! $AUDIO_FILES_OK; then
        echo "🎵 Audio files missing or incomplete"
        echo "   Check: $AUDIO_DIR"
        echo ""
    fi
    
    echo "After fixing issues, run:"
    echo "   source venv/bin/activate"
    echo "   streamlit run app.py"
fi

echo ""
echo "📚 For more info, see: README.md"
echo ""
