#!/usr/bin/env python3
"""
Smoke test for Mental AI Assistant services
"""
import requests
import time
import sys

MEDIA_SERVICE = "http://localhost:8001"
SPEECH_SERVICE = "http://localhost:8002"
REASONING_SERVICE = "http://localhost:8003"

def test_health_checks():
    print("🏥 Testing health checks...")
    services = {
        "Media": f"{MEDIA_SERVICE}/health",
        "Speech": f"{SPEECH_SERVICE}/health",
        "Reasoning": f"{REASONING_SERVICE}/health"
    }
    
    all_ok = True
    for name, url in services.items():
        try:
            resp = requests.get(url, timeout=5)
            if resp.ok:
                print(f"  ✅ {name} service: OK")
            else:
                print(f"  ❌ {name} service: FAILED")
                all_ok = False
        except Exception as e:
            print(f"  ❌ {name} service: ERROR ({e})")
            all_ok = False
    
    return all_ok

def test_tts():
    print("\n🔊 Testing TTS...")
    try:
        start = time.time()
        resp = requests.post(
            f"{SPEECH_SERVICE}/tts/speak",
            json={"text": "வணக்கம்", "voice": "ta-IN"},
            timeout=10
        )
        latency = (time.time() - start) * 1000
        
        if not resp.ok:
            print(f"  ❌ TTS failed")
            return False
        
        data = resp.json()
        print(f"  ✅ Generated audio: {data.get('file_url')}")
        print(f"  ⏱️  Latency: {latency:.0f}ms")
        return True
    except Exception as e:
        print(f"  ❌ TTS error: {e}")
        return False

def test_reasoning():
    print("\n💭 Testing reasoning...")
    try:
        start = time.time()
        resp = requests.post(
            f"{REASONING_SERVICE}/respond",
            json={
                "session_id": "test_123",
                "transcript_window": ["நான் கவலையாக இருக்கிறேன்"],
                "locale": "ta-IN"
            },
            timeout=15
        )
        latency = (time.time() - start) * 1000
        
        if not resp.ok:
            print(f"  ❌ Reasoning failed: {resp.text}")
            return False
        
        data = resp.json()
        response = data.get('reply_text', '')
        print(f"  ✅ Response: {response[:80]}...")
        print(f"  ⏱️  Latency: {latency:.0f}ms")
        
        risk_flags = data.get('risk_flags', {})
        if any(risk_flags.values()):
            print(f"  ⚠️  Risk flags: {risk_flags}")
        
        return True
    except Exception as e:
        print(f"  ❌ Reasoning error: {e}")
        return False

def test_e2e_timing():
    print("\n⏱️  Testing E2E timing...")
    try:
        e2e_start = time.time()
        
        # 1. Generate Tamil audio (simulates user speech)
        tts1_start = time.time()
        tts_resp = requests.post(
            f"{SPEECH_SERVICE}/tts/speak",
            json={"text": "நான் மிகவும் கவலையாக உணர்கிறேன்", "voice": "ta-IN"},
            timeout=10
        )
        tts1_time = (time.time() - tts1_start) * 1000
        
        # 2. Get reasoning response
        reason_start = time.time()
        reason_resp = requests.post(
            f"{REASONING_SERVICE}/respond",
            json={
                "session_id": "test_e2e",
                "transcript_window": ["நான் மிகவும் கவலையாக உணர்கிறேன்"],
                "locale": "ta-IN"
            },
            timeout=15
        )
        reason_time = (time.time() - reason_start) * 1000
        
        response_text = reason_resp.json().get('reply_text', '')
        
        # 3. Generate response audio
        tts2_start = time.time()
        tts_resp2 = requests.post(
            f"{SPEECH_SERVICE}/tts/speak",
            json={"text": response_text, "voice": "ta-IN"},
            timeout=10
        )
        tts2_time = (time.time() - tts2_start) * 1000
        
        e2e_time = (time.time() - e2e_start) * 1000
        
        print(f"  ✅ E2E completed:")
        print(f"     TTS (user): {tts1_time:.0f}ms")
        print(f"     Reasoning:  {reason_time:.0f}ms")
        print(f"     TTS (reply): {tts2_time:.0f}ms")
        print(f"     Total E2E:  {e2e_time:.0f}ms ({e2e_time/1000:.1f}s)")
        
        if e2e_time / 1000 <= 10:
            print(f"  ✅ PASS: E2E time ({e2e_time/1000:.1f}s) ≤ 10s target")
        else:
            print(f"  ⚠️  WARNING: E2E time ({e2e_time/1000:.1f}s) > 10s target")
        
        return True
    except Exception as e:
        print(f"  ❌ E2E error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 Mental AI Assistant - Smoke Test")
    print("=" * 60)
    
    all_passed = True
    all_passed &= test_health_checks()
    all_passed &= test_tts()
    all_passed &= test_reasoning()
    all_passed &= test_e2e_timing()
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All smoke tests passed!")
    else:
        print("❌ Some tests failed")
    print("=" * 60)
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
