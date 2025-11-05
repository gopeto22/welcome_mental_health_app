#!/bin/bash

# Google Cloud TTS Credentials Setup Script
# This script sets up the environment for Google Cloud Text-to-Speech API

set -e  # Exit on error

echo "🔧 Setting up Google Cloud TTS Credentials..."
echo ""

# Check if credentials file exists
CREDS_FILE="$HOME/.gcp/tts-credentials.json"

if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ ERROR: Credentials file not found at $CREDS_FILE"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
    echo "2. Navigate to: IAM & Admin → Service Accounts"
    echo "3. Find: tamil-tts-service@tamil-tts-dev.iam.gserviceaccount.com"
    echo "4. Click on it → Keys tab → ADD KEY → Create new key"
    echo "5. Choose JSON format and download"
    echo "6. Move the downloaded file:"
    echo "   mv ~/Downloads/tamil-tts-dev-*.json ~/.gcp/tts-credentials.json"
    echo "   chmod 600 ~/.gcp/tts-credentials.json"
    echo ""
    echo "See DOWNLOAD_GCP_KEY.md for detailed instructions."
    exit 1
fi

echo "✅ Found credentials file: $CREDS_FILE"
echo ""

# Verify JSON is valid
echo "🔍 Verifying JSON format..."
if python3 -c "import json; json.load(open('$CREDS_FILE'))" 2>/dev/null; then
    echo "✅ JSON file is valid"
else
    echo "❌ ERROR: Invalid JSON file"
    exit 1
fi
echo ""

# Set environment variable
echo "📝 Setting environment variable..."
export GOOGLE_APPLICATION_CREDENTIALS="$CREDS_FILE"
echo "✅ GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
echo ""

# Add to shell profile if not already there
SHELL_RC="$HOME/.zshrc"
if ! grep -q "GOOGLE_APPLICATION_CREDENTIALS" "$SHELL_RC" 2>/dev/null; then
    echo "📝 Adding to $SHELL_RC for persistence..."
    echo "" >> "$SHELL_RC"
    echo "# Google Cloud TTS Credentials" >> "$SHELL_RC"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$HOME/.gcp/tts-credentials.json\"" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC"
else
    echo "✅ Already in $SHELL_RC"
fi
echo ""

# Test the connection
echo "🧪 Testing Google Cloud TTS connection..."
python3 << 'EOF'
try:
    from google.cloud import texttospeech
    client = texttospeech.TextToSpeechClient()
    voices = client.list_voices()
    
    # Count Tamil and English voices
    tamil_voices = [v for v in voices.voices if 'ta-IN' in v.language_codes]
    english_voices = [v for v in voices.voices if 'en-GB' in v.language_codes or 'en-US' in v.language_codes]
    
    print("✅ Google Cloud TTS connection successful!")
    print(f"   Total voices available: {len(voices.voices)}")
    print(f"   Tamil voices: {len(tamil_voices)}")
    print(f"   English voices: {len(english_voices)}")
    
    # Show some available voices
    print("\n📢 Sample voices:")
    print("   Tamil: " + ", ".join([v.name for v in tamil_voices[:3]]))
    print("   English: " + ", ".join([v.name for v in english_voices[:3]]))
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\nTroubleshooting:")
    print("1. Check that Text-to-Speech API is enabled in your GCP project")
    print("2. Verify the service account has 'Cloud Text-to-Speech API User' role")
    print("3. Make sure the JSON key is valid and not expired")
    exit(1)
EOF

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your terminal or run: source ~/.zshrc"
echo "2. Generate voice samples: python scripts/generate_therapeutic_audio.py"
echo "3. Start testing the system with TTS enabled"
echo ""
