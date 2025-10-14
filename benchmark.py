#!/usr/bin/env python3
"""
Benchmark Script for Mental AI Assistant
Measures STT latency, LLM tokens/sec, and end-to-end turn time
"""

import time
import json
import requests
import statistics
from pathlib import Path
from typing import List, Dict, Tuple
import sys

# Service URLs
MEDIA_SERVICE = "http://localhost:8001"
SPEECH_SERVICE = "http://localhost:8002"
REASONING_SERVICE = "http://localhost:8003"

# Test utterances (Tamil phrases)
TEST_UTTERANCES = [
    "நான் மிகவும் கவலையாக உணர்கிறேன்",  # I feel very anxious
    "என்னால் தூங்க முடியவில்லை",  # I can't sleep
    "எனக்கு யாரிடமும் பேச முடியவில்லை",  # I can't talk to anyone
    "நான் தனிமையாக உணர்கிறேன்",  # I feel lonely
    "எனக்கு உதவி தேவை",  # I need help
    "என் வாழ்க்கை அர்த்தமற்றதாக உணர்கிறது",  # My life feels meaningless
    "நான் மிகவும் சோர்வாக இருக்கிறேன்",  # I feel very tired
    "எனக்கு யாரையும் நம்ப முடியவில்லை",  # I can't trust anyone
    "நான் பயப்படுகிறேன்",  # I'm scared
    "எனக்கு ஆதரவு தேவை",  # I need support
]

# Additional test phrases for broader coverage
EXTENDED_UTTERANCES = [
    "நான் மகிழ்ச்சியாக இருக்க விரும்புகிறேன்",  # I want to be happy
    "எனக்கு நல்ல நண்பர்கள் வேண்டும்",  # I want good friends
    "என் குடும்பம் என்னை புரிந்து கொள்ளவில்லை",  # My family doesn்t understand me
    "நான் என் எதிர்காலத்தைப் பற்றி கவலைப்படுகிறேன்",  # I worry about my future
    "எனக்கு யாராவது கேட்க வேண்டும்",  # I need someone to listen
    "நான் மன அழுத்தத்தில் இருக்கிறேன்",  # I am stressed
    "எனக்கு ஓய்வு தேவை",  # I need rest
    "நான் சோகமாக உணர்கிறேன்",  # I feel sad
    "எனக்கு நம்பிக்கை வேண்டும்",  # I need hope
    "நான் குழப்பமாக இருக்கிறேன்",  # I am confused
]

ALL_UTTERANCES = TEST_UTTERANCES + EXTENDED_UTTERANCES


class BenchmarkResults:
    """Store and analyze benchmark results"""
    
    def __init__(self):
        self.stt_latencies: List[float] = []
        self.reasoning_latencies: List[float] = []
        self.tts_latencies: List[float] = []
        self.e2e_latencies: List[float] = []
        self.stt_tokens_per_sec: List[float] = []
        self.reasoning_tokens_per_sec: List[float] = []
        
    def add_result(self, stt_ms: float, reasoning_ms: float, tts_ms: float, 
                   e2e_ms: float, transcript_len: int, response_len: int):
        self.stt_latencies.append(stt_ms)
        self.reasoning_latencies.append(reasoning_ms)
        self.tts_latencies.append(tts_ms)
        self.e2e_latencies.append(e2e_ms)
        
        # Calculate tokens/sec (rough estimate: 1 char ≈ 0.5 tokens)
        if stt_ms > 0:
            self.stt_tokens_per_sec.append((transcript_len * 0.5) / (stt_ms / 1000))
        if reasoning_ms > 0:
            self.reasoning_tokens_per_sec.append((response_len * 0.5) / (reasoning_ms / 1000))
    
    def summary(self) -> Dict:
        """Generate summary statistics"""
        def stats(data: List[float]) -> Dict:
            if not data:
                return {"mean": 0, "median": 0, "p95": 0, "p99": 0}
            return {
                "mean": statistics.mean(data),
                "median": statistics.median(data),
                "p95": sorted(data)[int(len(data) * 0.95)] if len(data) > 0 else 0,
                "p99": sorted(data)[int(len(data) * 0.99)] if len(data) > 0 else 0,
            }
        
        return {
            "stt_latency_ms": stats(self.stt_latencies),
            "reasoning_latency_ms": stats(self.reasoning_latencies),
            "tts_latency_ms": stats(self.tts_latencies),
            "e2e_latency_ms": stats(self.e2e_latencies),
            "stt_tokens_per_sec": stats(self.stt_tokens_per_sec),
            "reasoning_tokens_per_sec": stats(self.reasoning_tokens_per_sec),
        }


def check_services() -> bool:
    """Check if all services are running"""
    print("🔍 Checking services...")
    services = [
        ("Media", MEDIA_SERVICE),
        ("Speech", SPEECH_SERVICE),
        ("Reasoning", REASONING_SERVICE),
    ]
    
    all_healthy = True
    for name, url in services:
        try:
            resp = requests.get(f"{url}/health", timeout=5)
            if resp.ok:
                print(f"  ✅ {name} service: OK")
            else:
                print(f"  ❌ {name} service: FAILED (status {resp.status_code})")
                all_healthy = False
        except Exception as e:
            print(f"  ❌ {name} service: UNREACHABLE ({e})")
            all_healthy = False
    
    return all_healthy


def synthesize_audio(text: str) -> Tuple[bytes, float]:
    """
    Synthesize audio from text (for testing).
    In real benchmark, use pre-recorded Tamil audio files.
    """
    start = time.time()
    resp = requests.post(
        f"{SPEECH_SERVICE}/tts/speak",
        json={"text": text, "locale": "ta-IN"},
        timeout=30
    )
    latency_ms = (time.time() - start) * 1000
    
    if not resp.ok:
        raise Exception(f"TTS failed: {resp.text}")
    
    data = resp.json()
    audio_url = f"{SPEECH_SERVICE}{data.get('file_url') or data.get('audioUrl')}"
    
    # Download audio
    audio_resp = requests.get(audio_url, timeout=10)
    return audio_resp.content, latency_ms


def run_e2e_benchmark(text: str, session_id: str, seq_index: int, 
                     audio_file: Path = None) -> Dict:
    """
    Run end-to-end benchmark: audio → STT → reasoning → TTS
    """
    print(f"\n🎤 Testing: {text[:50]}...")
    
    e2e_start = time.time()
    
    # Step 1: Synthesize audio (or use pre-recorded file)
    if audio_file and audio_file.exists():
        with open(audio_file, 'rb') as f:
            audio_data = f.read()
        tts_synth_ms = 0  # Pre-recorded, no synthesis time
    else:
        print("  ⚠️  No audio file; synthesizing from text (less accurate)")
        audio_data, tts_synth_ms = synthesize_audio(text)
    
    # Step 2: Upload audio chunk (includes STT)
    stt_start = time.time()
    files = {'file': ('audio.wav', audio_data, 'audio/wav')}
    resp = requests.post(
        f"{MEDIA_SERVICE}/media/chunk-upload",
        params={"session_id": session_id, "sequence_index": seq_index},
        files=files,
        timeout=30
    )
    stt_latency_ms = (time.time() - stt_start) * 1000
    
    if not resp.ok:
        raise Exception(f"STT failed: {resp.text}")
    
    stt_data = resp.json()
    transcript = stt_data.get("transcript", "")
    stt_timing = stt_data.get("timing_ms", stt_latency_ms)
    
    print(f"  📝 Transcript: {transcript} ({stt_timing:.0f}ms)")
    
    # Step 3: Generate response
    reasoning_start = time.time()
    resp = requests.post(
        f"{REASONING_SERVICE}/respond",
        json={
            "session_id": session_id,
            "user_input": transcript,
            "locale": "ta-IN"
        },
        timeout=30
    )
    reasoning_latency_ms = (time.time() - reasoning_start) * 1000
    
    if not resp.ok:
        raise Exception(f"Reasoning failed: {resp.text}")
    
    reasoning_data = resp.json()
    response_text = reasoning_data.get("response", "")
    reasoning_timing = reasoning_data.get("timing_ms", reasoning_latency_ms)
    
    print(f"  💭 Response: {response_text[:60]}... ({reasoning_timing:.0f}ms)")
    
    # Step 4: TTS for response
    tts_start = time.time()
    resp = requests.post(
        f"{SPEECH_SERVICE}/tts/speak",
        json={"text": response_text, "locale": "ta-IN"},
        timeout=30
    )
    tts_latency_ms = (time.time() - tts_start) * 1000
    
    if not resp.ok:
        raise Exception(f"TTS failed: {resp.text}")
    
    tts_data = resp.json()
    tts_timing = tts_data.get("timing_ms", tts_latency_ms)
    
    print(f"  🔊 Audio ready ({tts_timing:.0f}ms)")
    
    e2e_latency_ms = (time.time() - e2e_start) * 1000
    print(f"  ⏱️  E2E: {e2e_latency_ms:.0f}ms")
    
    return {
        "transcript": transcript,
        "response": response_text,
        "stt_ms": stt_timing,
        "reasoning_ms": reasoning_timing,
        "tts_ms": tts_timing,
        "e2e_ms": e2e_latency_ms,
    }


def main():
    print("=" * 60)
    print("🚀 Mental AI Assistant - Benchmark Suite")
    print("=" * 60)
    
    # Check services
    if not check_services():
        print("\n❌ Some services are not running. Start them first:")
        print("   ./start-services.sh")
        sys.exit(1)
    
    print("\n📊 Running benchmark with 20 Tamil utterances...")
    print("=" * 60)
    
    results = BenchmarkResults()
    session_id = f"bench_{int(time.time())}"
    
    # Run benchmarks
    test_set = ALL_UTTERANCES[:20]  # Use first 20
    for i, text in enumerate(test_set):
        try:
            result = run_e2e_benchmark(text, session_id, i)
            results.add_result(
                stt_ms=result["stt_ms"],
                reasoning_ms=result["reasoning_ms"],
                tts_ms=result["tts_ms"],
                e2e_ms=result["e2e_ms"],
                transcript_len=len(result["transcript"]),
                response_len=len(result["response"]),
            )
        except Exception as e:
            print(f"  ❌ Error: {e}")
            continue
    
    # Print summary
    print("\n" + "=" * 60)
    print("📈 BENCHMARK RESULTS")
    print("=" * 60)
    
    summary = results.summary()
    
    print("\n🎤 STT Latency:")
    print(f"  Mean:   {summary['stt_latency_ms']['mean']:.0f}ms")
    print(f"  Median: {summary['stt_latency_ms']['median']:.0f}ms")
    print(f"  P95:    {summary['stt_latency_ms']['p95']:.0f}ms")
    print(f"  P99:    {summary['stt_latency_ms']['p99']:.0f}ms")
    
    print("\n💭 Reasoning Latency:")
    print(f"  Mean:   {summary['reasoning_latency_ms']['mean']:.0f}ms")
    print(f"  Median: {summary['reasoning_latency_ms']['median']:.0f}ms")
    print(f"  P95:    {summary['reasoning_latency_ms']['p95']:.0f}ms")
    print(f"  P99:    {summary['reasoning_latency_ms']['p99']:.0f}ms")
    
    print("\n🔊 TTS Latency:")
    print(f"  Mean:   {summary['tts_latency_ms']['mean']:.0f}ms")
    print(f"  Median: {summary['tts_latency_ms']['median']:.0f}ms")
    print(f"  P95:    {summary['tts_latency_ms']['p95']:.0f}ms")
    print(f"  P99:    {summary['tts_latency_ms']['p99']:.0f}ms")
    
    print("\n⏱️  End-to-End Turn Time:")
    print(f"  Mean:   {summary['e2e_latency_ms']['mean']:.0f}ms ({summary['e2e_latency_ms']['mean']/1000:.1f}s)")
    print(f"  Median: {summary['e2e_latency_ms']['median']:.0f}ms ({summary['e2e_latency_ms']['median']/1000:.1f}s)")
    print(f"  P95:    {summary['e2e_latency_ms']['p95']:.0f}ms ({summary['e2e_latency_ms']['p95']/1000:.1f}s)")
    print(f"  P99:    {summary['e2e_latency_ms']['p99']:.0f}ms ({summary['e2e_latency_ms']['p99']/1000:.1f}s)")
    
    print("\n🎯 Throughput:")
    print(f"  STT:       {summary['stt_tokens_per_sec']['mean']:.1f} tokens/sec")
    print(f"  Reasoning: {summary['reasoning_tokens_per_sec']['mean']:.1f} tokens/sec")
    
    # Save results
    output_file = Path("benchmark-results.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": time.time(),
            "session_id": session_id,
            "summary": summary,
            "raw_results": {
                "stt_latencies": results.stt_latencies,
                "reasoning_latencies": results.reasoning_latencies,
                "tts_latencies": results.tts_latencies,
                "e2e_latencies": results.e2e_latencies,
            }
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {output_file}")
    
    # Acceptance check
    print("\n" + "=" * 60)
    print("✅ ACCEPTANCE CHECK")
    print("=" * 60)
    
    mean_e2e = summary['e2e_latency_ms']['mean'] / 1000
    target = 10.0  # 10 seconds
    
    if mean_e2e <= target:
        print(f"✅ PASS: Mean E2E ({mean_e2e:.1f}s) ≤ target ({target}s)")
    else:
        print(f"⚠️  WARN: Mean E2E ({mean_e2e:.1f}s) > target ({target}s)")
        print("   Consider: GPU acceleration, smaller models, or caching")
    
    print("\n✨ Benchmark complete!")


if __name__ == "__main__":
    main()
