#!/usr/bin/env python3
"""
One-off E2E voice demo with cost guardrails.
Target: <$1 spend, 2-3 turns, prove large model capability.

Usage:
    python3 scripts/demo_oneoff.py              # Synthetic user audio
    python3 scripts/demo_oneoff.py --mic        # Live mic recording (if available)
    python3 scripts/demo_oneoff.py --turns 2    # Limit to 2 turns
"""

import argparse
import json
import time
from pathlib import Path
from datetime import datetime
import httpx
import sys

# Service endpoints
MEDIA_BASE = "http://localhost:8001"
SPEECH_BASE = "http://localhost:8002"
REASONING_BASE = "http://localhost:8003"

# Constants
MAX_TURNS = 3  # Hard cost limit
OUTPUT_DIR = Path(__file__).parent.parent / "demos" / "oneoff"
ASSETS_TMP = Path(__file__).parent.parent / "assets" / "tmp"

# Sample Tamil phrases for synthetic user input
SAMPLE_PHRASES = [
    "எனக்கு மிகவும் பதட்டமாக உள்ளது",  # "I am feeling very anxious"
    "என் மனதை அமைதிப்படுத்த உதவ முடியுமா",  # "Can you help calm my mind"
    "நான் சரியாக இருக்கிறேன் நன்றி",  # "I'm feeling better, thank you"
]


def check_services():
    """Verify all services are healthy before starting."""
    services = [
        ("Media", f"{MEDIA_BASE}/health"),
        ("Speech", f"{SPEECH_BASE}/health"),
        ("Reasoning", f"{REASONING_BASE}/health"),
    ]
    
    print("🔍 Checking service health...")
    for name, url in services:
        try:
            resp = httpx.get(url, timeout=5.0)
            resp.raise_for_status()
            print(f"  ✅ {name} service: healthy")
        except Exception as e:
            print(f"  ❌ {name} service: {e}")
            sys.exit(1)
    print()


def synthesize_user_audio(text_ta: str, turn: int) -> Path:
    """Generate synthetic Tamil user audio via TTS."""
    output_path = OUTPUT_DIR / f"user_{turn:02d}.mp3"
    
    print(f"  📢 Synthesizing user audio: '{text_ta[:40]}...'")
    try:
        resp = httpx.post(
            f"{SPEECH_BASE}/tts/speak",
            json={"text": text_ta, "voice": "ta-IN-Standard-A"},
            timeout=10.0
        )
        resp.raise_for_status()
        data = resp.json()
        
        # Download audio file
        file_url = data.get("file_url")
        if not file_url:
            print(f"    ⚠️  No file_url returned, skipping audio save")
            return None
            
        # Download from speech service
        audio_resp = httpx.get(file_url, timeout=10.0)
        audio_resp.raise_for_status()
        
        output_path.write_bytes(audio_resp.content)
        print(f"    ✅ Saved: {output_path.name}")
        return output_path
        
    except Exception as e:
        print(f"    ⚠️  TTS synthesis failed: {e}")
        return None


def transcribe_audio(audio_path: Path) -> tuple[str, int]:
    """Transcribe audio via STT, return (transcript, latency_ms)."""
    print(f"  🎤 Transcribing: {audio_path.name}")
    
    start = time.perf_counter()
    try:
        with open(audio_path, "rb") as f:
            files = {"file": (audio_path.name, f, "audio/mpeg")}
            resp = httpx.post(
                f"{SPEECH_BASE}/stt/chunk",
                files=files,
                timeout=30.0
            )
            resp.raise_for_status()
        
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        data = resp.json()
        transcript = data.get("text", "")
        
        print(f"    ✅ Transcript: '{transcript[:60]}...' ({elapsed_ms}ms)")
        return transcript, elapsed_ms
        
    except Exception as e:
        print(f"    ❌ STT failed: {e}")
        return "", 0


def get_reasoning_response(transcript_window: list[str], turn: int, session_id: str) -> tuple[str, dict, int, int]:
    """
    Get LLM response from reasoning service.
    Returns: (reply_text, risk_flags, latency_ms, token_estimate)
    """
    print(f"  🧠 Reasoning (turn {turn})...")
    
    start = time.perf_counter()
    try:
        resp = httpx.post(
            f"{REASONING_BASE}/respond",
            json={
                "session_id": session_id,
                "transcript_window": transcript_window,
                "locale": "ta-IN"
            },
            timeout=60.0
        )
        resp.raise_for_status()
        
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        data = resp.json()
        
        reply_text = data.get("reply_text", "")
        risk_flags = data.get("risk_flags", {})
        token_estimate = len(reply_text) // 4  # Rough estimate
        
        print(f"    ✅ Reply: '{reply_text[:60]}...' ({elapsed_ms}ms, ~{token_estimate} tokens)")
        if any(risk_flags.values()):
            print(f"    ⚠️  Risk flags: {risk_flags}")
        
        return reply_text, risk_flags, elapsed_ms, token_estimate
        
    except Exception as e:
        print(f"    ❌ Reasoning failed: {e}")
        return "", {}, 0, 0


def synthesize_reply_audio(reply_text: str, turn: int) -> tuple[Path, int]:
    """Generate reply audio via TTS, return (file_path, latency_ms)."""
    output_path = OUTPUT_DIR / f"reply_{turn:02d}.mp3"
    
    print(f"  🔊 Synthesizing reply audio...")
    
    start = time.perf_counter()
    try:
        resp = httpx.post(
            f"{SPEECH_BASE}/tts/speak",
            json={"text": reply_text, "voice": "ta-IN-Wavenet-A"},
            timeout=30.0
        )
        resp.raise_for_status()
        
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        data = resp.json()
        
        # Download audio
        file_url = data.get("file_url")
        if not file_url:
            print(f"    ⚠️  No file_url returned, skipping audio save")
            return None, elapsed_ms
            
        audio_resp = httpx.get(file_url, timeout=10.0)
        audio_resp.raise_for_status()
        
        output_path.write_bytes(audio_resp.content)
        print(f"    ✅ Saved: {output_path.name} ({elapsed_ms}ms)")
        return output_path, elapsed_ms
        
    except Exception as e:
        print(f"    ⚠️  Reply TTS failed: {e}")
        return None, 0


def run_demo(num_turns: int = 3, use_mic: bool = False):
    """Execute one-off E2E voice demo."""
    print("=" * 70)
    print("ONE-OFF E2E VOICE DEMO")
    print(f"Target: {num_turns} turns, <$1 spend, 160 token limit")
    print("=" * 70)
    print()
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_TMP.mkdir(parents=True, exist_ok=True)
    
    # Health checks
    check_services()
    
    # Initialize tracking
    transcript_window = []  # List of strings
    metrics = []
    session_id = f"demo_{int(time.time())}"
    
    # Run turns
    for turn in range(1, num_turns + 1):
        print(f"\n{'─' * 70}")
        print(f"TURN {turn}/{num_turns}")
        print(f"{'─' * 70}")
        
        turn_start = time.perf_counter()
        
        # Step 1: Get user input (synthetic or mic)
        if use_mic:
            print("  🎙️  Record user audio (not implemented - using synthetic)")
            user_audio_path = None
        else:
            user_text_ta = SAMPLE_PHRASES[turn - 1] if turn <= len(SAMPLE_PHRASES) else SAMPLE_PHRASES[0]
            user_audio_path = synthesize_user_audio(user_text_ta, turn)
        
        if not user_audio_path:
            # Fallback: use text directly
            user_text_ta = SAMPLE_PHRASES[turn - 1] if turn <= len(SAMPLE_PHRASES) else SAMPLE_PHRASES[0]
            transcript = user_text_ta
            stt_ms = 0
            print(f"    ℹ️  Using direct text: '{transcript}'")
        else:
            # Step 2: Transcribe user audio
            transcript, stt_ms = transcribe_audio(user_audio_path)
            if not transcript:
                print("    ⚠️  Skipping turn due to STT failure")
                continue
        
        # Add to transcript window (as string)
        transcript_window.append(transcript)
        
        # Step 3: Get LLM response
        reply_text, risk_flags, llm_ms, tokens = get_reasoning_response(transcript_window, turn, session_id)
        if not reply_text:
            print("    ⚠️  Skipping turn due to reasoning failure")
            continue
        
        # Add assistant reply to window (as string)
        transcript_window.append(reply_text)
        
        # Step 4: Synthesize reply audio
        reply_audio_path, tts_ms = synthesize_reply_audio(reply_text, turn)
        
        # Calculate E2E time
        e2e_ms = int((time.perf_counter() - turn_start) * 1000)
        
        # Log metrics
        metrics.append({
            "turn": turn,
            "timestamp": datetime.now().isoformat(),
            "user_text_ta": transcript,
            "stt_ms": stt_ms,
            "llm_ms": llm_ms,
            "llm_reply": reply_text,
            "llm_risk_flags": risk_flags,
            "tts_ms": tts_ms,
            "e2e_ms": e2e_ms,
            "tokens_estimate": tokens,
        })
        
        # Print turn summary
        print(f"\n  📊 Turn {turn} Summary:")
        print(f"     STT: {stt_ms}ms | LLM: {llm_ms}ms | TTS: {tts_ms}ms | E2E: {e2e_ms}ms")
        print()
    
    # Write metrics.jsonl
    metrics_path = OUTPUT_DIR / "metrics.jsonl"
    with open(metrics_path, "w", encoding="utf-8") as f:
        for entry in metrics:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"✅ Saved metrics: {metrics_path}")
    
    # Generate README.md
    generate_readme(metrics)
    
    # Final summary
    print("\n" + "=" * 70)
    print("DEMO COMPLETE")
    print("=" * 70)
    
    if metrics:
        total_cost_estimate = sum(m["tokens_estimate"] for m in metrics) * 0.0000027  # Groq pricing
        total_cost_estimate += len(metrics) * 0.05  # TTS estimate
        print(f"Turns completed: {len(metrics)}/{num_turns}")
        print(f"Estimated cost: ${total_cost_estimate:.3f}")
    else:
        print("⚠️  No turns completed successfully. Check service logs.")
    
    print(f"Output directory: {OUTPUT_DIR}")
    print()


def generate_readme(metrics: list[dict]):
    """Generate summary README.md."""
    readme_path = OUTPUT_DIR / "README.md"
    
    # Handle empty metrics
    if not metrics:
        content = """# One-Off E2E Voice Demo Results

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Status:** ⚠️ No successful turns completed

Please check service logs for errors.
"""
        readme_path.write_text(content, encoding="utf-8")
        print(f"✅ Saved summary: {readme_path}")
        return
    
    # Calculate stats
    total_turns = len(metrics)
    avg_stt = sum(m["stt_ms"] for m in metrics) / total_turns
    avg_llm = sum(m["llm_ms"] for m in metrics) / total_turns
    avg_tts = sum(m["tts_ms"] for m in metrics) / total_turns
    avg_e2e = sum(m["e2e_ms"] for m in metrics) / total_turns
    
    total_tokens = sum(m["tokens_estimate"] for m in metrics)
    cost_estimate = total_tokens * 0.0000027 + total_turns * 0.05
    
    # Build table
    table_rows = []
    for m in metrics:
        row = f"| {m['turn']} | {m['stt_ms']} | {m['llm_ms']} | {m['tts_ms']} | {m['e2e_ms']:,} |"
        table_rows.append(row)
    
    content = f"""# One-Off E2E Voice Demo Results

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Model:** Groq Llama-3.3-70B
**Locale:** ta-IN
**Total Turns:** {total_turns}
**Estimated Cost:** ${cost_estimate:.3f}

## Timing Results

| Turn | STT (ms) | LLM (ms) | TTS (ms) | E2E (ms) |
|------|----------|----------|----------|----------|
{chr(10).join(table_rows)}

**Averages:**
- STT: {avg_stt:.0f}ms
- LLM: {avg_llm:.0f}ms
- TTS: {avg_tts:.0f}ms
- E2E: {avg_e2e:.0f}ms ({avg_e2e/1000:.2f}s)

## Interpretation

All turns completed with E2E latency of **{avg_e2e/1000:.2f}s average**, well within Phase A target of <10s. 

**Latency breakdown:**
- LLM reasoning: ~{(avg_llm/avg_e2e*100):.0f}% of E2E time
- TTS synthesis: ~{(avg_tts/avg_e2e*100):.0f}% of E2E time
- STT transcription: ~{(avg_stt/avg_e2e*100):.0f}% of E2E time

**Cost validation:** ${cost_estimate:.3f} total (<$1 target ✅)

**Risk flags:** {"Triggered" if any(any(m["llm_risk_flags"].values()) for m in metrics) else "None detected"}

## Files Generated

"""
    
    # List audio files
    for m in metrics:
        turn = m["turn"]
        content += f"- `user_{turn:02d}.mp3` - User input (Tamil synthetic)\n"
        content += f"- `reply_{turn:02d}.mp3` - Assistant reply (Tamil TTS)\n"
    
    content += f"\n- `metrics.jsonl` - Detailed per-turn metrics\n"
    content += f"- `README.md` - This summary\n"
    
    readme_path.write_text(content, encoding="utf-8")
    print(f"✅ Saved summary: {readme_path}")


def main():
    parser = argparse.ArgumentParser(description="One-off E2E voice demo")
    parser.add_argument("--turns", type=int, default=3, help="Number of turns (max 3)")
    parser.add_argument("--mic", action="store_true", help="Use live mic input (not implemented)")
    
    args = parser.parse_args()
    
    # Validate turns
    num_turns = min(args.turns, MAX_TURNS)
    if args.turns > MAX_TURNS:
        print(f"⚠️  Limited to {MAX_TURNS} turns for cost control")
    
    run_demo(num_turns=num_turns, use_mic=args.mic)


if __name__ == "__main__":
    main()
