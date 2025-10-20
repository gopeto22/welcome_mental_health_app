# One-Off E2E Voice Demo Results

**Date:** 2025-10-20 15:49:59
**Model:** Groq Llama-3.3-70B
**Locale:** ta-IN
**Total Turns:** 3
**Estimated Cost:** $0.150

## Timing Results

| Turn | STT (ms) | LLM (ms) | TTS (ms) | E2E (ms) |
|------|----------|----------|----------|----------|
| 1 | 450 | 779 | 830 | 2,143 |
| 2 | 281 | 856 | 612 | 1,835 |
| 3 | 324 | 716 | 827 | 1,951 |

**Averages:**
- STT: 352ms
- LLM: 784ms
- TTS: 756ms
- E2E: 1976ms (1.98s)

## Interpretation

All turns completed with E2E latency of **1.98s average**, well within Phase A target of <10s. 

**Latency breakdown:**
- LLM reasoning: ~40% of E2E time
- TTS synthesis: ~38% of E2E time
- STT transcription: ~18% of E2E time

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
