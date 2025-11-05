#!/bin/bash

# Quick Google Cloud TTS Setup - Interactive Script
# This script helps you quickly set up Google Cloud credentials

echo "═══════════════════════════════════════════════════════════════"
echo "  🔐 Google Cloud TTS Credentials Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if credentials already exist
CREDS_FILE="$HOME/.gcp/tts-credentials.json"

if [ -f "$CREDS_FILE" ]; then
    echo "✅ Credentials file already exists at: $CREDS_FILE"
    echo ""
    echo "Do you want to:"
    echo "  1) Use existing credentials"
    echo "  2) Replace with new credentials"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" != "2" ]; then
        echo ""
        echo "Using existing credentials..."
        export GOOGLE_APPLICATION_CREDENTIALS="$CREDS_FILE"
        
        # Test connection
        echo ""
        echo "🧪 Testing connection..."
        python3 << 'EOF'
try:
    from google.cloud import texttospeech
    client = texttospeech.TextToSpeechClient()
    print("✅ Connection successful!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)
EOF
        echo ""
        echo "✅ Setup complete! You're ready to go."
        exit 0
    fi
fi

echo ""
echo "📋 STEP 1: Download JSON Key from Google Cloud Console"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "Based on your console info, you need to:"
echo ""
echo "  1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "  2. Select project: tamil-tts-dev"
echo "  3. Find service account: tamil-tts-service@tamil-tts-dev.iam.gserviceaccount.com"
echo "  4. Click on it, then go to the 'Keys' tab"
echo "  5. Click 'ADD KEY' → 'Create new key'"
echo "  6. Choose 'JSON' format"
echo "  7. Click 'Create' (file will download)"
echo ""
echo "The downloaded file will be named something like:"
echo "  tamil-tts-dev-xxxxxxxxxxxxx.json"
echo ""

read -p "Press ENTER when you've downloaded the JSON key file..."

echo ""
echo "📁 STEP 2: Locate the Downloaded File"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Try to find the file automatically
DOWNLOADS="$HOME/Downloads"
LATEST_JSON=$(find "$DOWNLOADS" -name "tamil-tts-dev-*.json" -type f -mtime -1 2>/dev/null | head -1)

if [ -n "$LATEST_JSON" ]; then
    echo "✅ Found recently downloaded file:"
    echo "   $LATEST_JSON"
    echo ""
    read -p "Is this the correct file? (y/n): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        JSON_FILE="$LATEST_JSON"
    else
        read -p "Enter the full path to the JSON file: " JSON_FILE
    fi
else
    echo "Could not automatically find the JSON file."
    echo ""
    read -p "Enter the full path to the JSON file: " JSON_FILE
fi

# Verify file exists
if [ ! -f "$JSON_FILE" ]; then
    echo ""
    echo "❌ ERROR: File not found: $JSON_FILE"
    echo ""
    echo "Please check the path and try again."
    exit 1
fi

# Verify it's valid JSON
echo ""
echo "🔍 Verifying JSON file..."
if ! python3 -c "import json; json.load(open('$JSON_FILE'))" 2>/dev/null; then
    echo "❌ ERROR: Invalid JSON file"
    echo ""
    echo "The file doesn't appear to be valid JSON."
    echo "Please make sure you downloaded the correct file."
    exit 1
fi

echo "✅ JSON file is valid"

echo ""
echo "📂 STEP 3: Install Credentials"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Create .gcp directory
mkdir -p "$HOME/.gcp"

# Copy file
cp "$JSON_FILE" "$CREDS_FILE"
chmod 600 "$CREDS_FILE"

echo "✅ Credentials installed to: $CREDS_FILE"
echo "✅ Permissions set to 600 (secure)"

echo ""
echo "⚙️  STEP 4: Configure Environment"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="$CREDS_FILE"
echo "✅ Environment variable set for current session"

# Add to shell profile
SHELL_RC="$HOME/.zshrc"
if ! grep -q "GOOGLE_APPLICATION_CREDENTIALS.*tts-credentials.json" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Google Cloud TTS Credentials" >> "$SHELL_RC"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$HOME/.gcp/tts-credentials.json\"" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC for future sessions"
else
    echo "✅ Already in $SHELL_RC"
fi

echo ""
echo "🧪 STEP 5: Test Connection"
echo "─────────────────────────────────────────────────────────────"
echo ""

python3 << 'EOF'
try:
    from google.cloud import texttospeech
    
    print("Connecting to Google Cloud TTS...")
    client = texttospeech.TextToSpeechClient()
    
    print("Fetching available voices...")
    voices = client.list_voices()
    
    # Count voices
    tamil_voices = [v for v in voices.voices if 'ta-IN' in v.language_codes]
    english_voices = [v for v in voices.voices if 'en-GB' in v.language_codes or 'en-US' in v.language_codes]
    
    print("")
    print("═══════════════════════════════════════════════════════════")
    print("  ✅ CONNECTION SUCCESSFUL!")
    print("═══════════════════════════════════════════════════════════")
    print("")
    print(f"📊 Available Voices:")
    print(f"   Total: {len(voices.voices)}")
    print(f"   Tamil (ta-IN): {len(tamil_voices)}")
    print(f"   English: {len(english_voices)}")
    print("")
    print("📢 Sample Tamil voices:")
    for v in tamil_voices[:3]:
        gender = "Male" if v.ssml_gender == 1 else "Female" if v.ssml_gender == 2 else "Neutral"
        print(f"   • {v.name} ({gender})")
    print("")
    print("📢 Sample English voices:")
    for v in english_voices[:3]:
        gender = "Male" if v.ssml_gender == 1 else "Female" if v.ssml_gender == 2 else "Neutral"
        print(f"   • {v.name} ({gender})")
    print("")
    
except ImportError:
    print("❌ ERROR: google-cloud-texttospeech not installed")
    print("")
    print("Install it with:")
    print("  cd services/speech-service")
    print("  source venv/bin/activate")
    print("  pip install google-cloud-texttospeech")
    exit(1)
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("")
    print("Troubleshooting:")
    print("1. Check that Text-to-Speech API is enabled:")
    print("   https://console.cloud.google.com/apis/library/texttospeech.googleapis.com")
    print("")
    print("2. Verify service account has 'Cloud Text-to-Speech API User' role:")
    print("   https://console.cloud.google.com/iam-admin/serviceaccounts")
    print("")
    print("3. Make sure you're using the correct project (tamil-tts-dev)")
    exit(1)
EOF

if [ $? -eq 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  🎉 SETUP COMPLETE!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "✅ Google Cloud TTS is ready to use"
    echo ""
    echo "Next steps:"
    echo "  1. Generate voice samples:"
    echo "     python scripts/generate_therapeutic_audio.py"
    echo ""
    echo "  2. Or restart your terminal to ensure env var is loaded:"
    echo "     source ~/.zshrc"
    echo ""
    echo "  3. Start using TTS in your services"
    echo ""
else
    echo ""
    echo "⚠️  Setup completed but connection test failed"
    echo "   Please review the errors above and try again"
    echo ""
    exit 1
fi
