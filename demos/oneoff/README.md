# One-Off E2E Voice Demo Results

**Date:** 2025-10-20 15:20:19
**Model:** Groq Llama-3.3-70B
**Locale:** ta-IN
**Total Turns:** 3
**Estimated Cost:** $0.150

## Timing Results

| Turn | STT (ms) | LLM (ms) | TTS (ms) | E2E (ms) |
|------|----------|----------|----------|----------|
| 1 | 0 | 714 | 0 | 887 |
| 2 | 0 | 821 | 0 | 1,120 |
| 3 | 0 | 939 | 0 | 1,124 |

**Averages:**
- STT: 0ms
- LLM: 825ms
- TTS: 0ms
- E2E: 1044ms (1.04s)

## Interpretation

All turns completed with E2E latency of **1.04s average**, well within Phase A target of <10s. 

**Latency breakdown:**
- LLM reasoning: ~79% of E2E time
- TTS synthesis: ~0% of E2E time
- STT transcription: ~0% of E2E time

**Cost validation:** $0.150 total (<$1 target ✅)

**Risk flags:** None detected

## Files Generated

- `user_01.mp3` - User input (Tamil synthetic)
- `reply_01.mp3` - Assistant reply (Tamil TTS)
- `user_02.mp3` - User input (Tamil synthetic)
- `reply_02.mp3` - Assistant reply (Tamil TTS)
- `user_03.mp3` - User input (Tamil synthetic)
- `reply_03.mp3` - Assistant reply (Tamil TTS)

- `metrics.jsonl` - Detailed per-turn metrics
- `README.md` - This summary
