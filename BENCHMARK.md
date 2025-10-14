# Benchmark Instructions

## Prerequisites

1. **Start all services:**
   ```bash
   ./start-services.sh
   ```

2. **Install Python dependencies:**
   ```bash
   pip install requests
   ```

## Running Benchmarks

### Phase A (API) Baseline

```bash
# Ensure Phase A is configured
cd services/speech-service && cat .env
# Should show: STT_PROVIDER=api, TTS_PROVIDER=api

cd services/reasoning-service && cat .env
# Should show: REASONER=server

# Run benchmark
cd ../..
python3 benchmark.py
```

**Expected output:**
```
🚀 Mental AI Assistant - Benchmark Suite
==========================================================
🔍 Checking services...
  ✅ Media service: OK
  ✅ Speech service: OK
  ✅ Reasoning service: OK

📊 Running benchmark with 20 Tamil utterances...
...

📈 BENCHMARK RESULTS
==========================================================
🎤 STT Latency:
  Mean:   1200ms
  Median: 1100ms
  P95:    1800ms
  P99:    2000ms

💭 Reasoning Latency:
  Mean:   2100ms
  Median: 2000ms
  P95:    3200ms
  P99:    3500ms

🔊 TTS Latency:
  Mean:   950ms
  Median: 900ms
  P95:    1300ms
  P99:    1400ms

⏱️  End-to-End Turn Time:
  Mean:   4250ms (4.3s)
  Median: 4000ms (4.0s)
  P95:    6300ms (6.3s)
  P99:    6900ms (6.9s)

✅ PASS: Mean E2E (4.3s) ≤ target (10.0s)
```

### Phase B (Local) Comparison

```bash
# Switch to Phase B
cd services/speech-service
sed -i '' 's/STT_PROVIDER=api/STT_PROVIDER=local/' .env
sed -i '' 's/TTS_PROVIDER=api/TTS_PROVIDER=local/' .env

cd ../reasoning-service
sed -i '' 's/REASONER=server/REASONER=local/' .env

# Restart services
cd ../..
./stop-services.sh
./start-services.sh

# Run benchmark again
python3 benchmark.py
```

**Expected output (CPU):**
```
⏱️  End-to-End Turn Time:
  Mean:   8500ms (8.5s)
  Median: 8200ms (8.2s)
  P95:    11000ms (11.0s)
  P99:    12000ms (12.0s)

⚠️  WARN: Mean E2E (8.5s) > target (10.0s)
   Consider: GPU acceleration, smaller models, or caching
```

**Expected output (GPU - g5.xlarge):**
```
⏱️  End-to-End Turn Time:
  Mean:   3200ms (3.2s)
  Median: 3000ms (3.0s)
  P95:    4500ms (4.5s)
  P99:    5000ms (5.0s)

✅ PASS: Mean E2E (3.2s) ≤ target (10.0s)
```

## Analyzing Results

### View JSON Output

```bash
cat benchmark-results.json | jq .
```

### Compare Phases

```bash
# Run Phase A, save results
python3 benchmark.py
mv benchmark-results.json phase-a-results.json

# Switch to Phase B
# ... (config changes)

# Run Phase B, save results
python3 benchmark.py
mv benchmark-results.json phase-b-results.json

# Compare
jq '.summary.e2e_latency_ms.mean' phase-a-results.json
jq '.summary.e2e_latency_ms.mean' phase-b-results.json
```

### Plot Results (Optional)

```python
import json
import matplotlib.pyplot as plt

# Load results
with open('phase-a-results.json') as f:
    phase_a = json.load(f)

with open('phase-b-results.json') as f:
    phase_b = json.load(f)

# Plot comparison
plt.figure(figsize=(10, 6))
stages = ['STT', 'Reasoning', 'TTS', 'E2E']
phase_a_means = [
    phase_a['summary']['stt_latency_ms']['mean'],
    phase_a['summary']['reasoning_latency_ms']['mean'],
    phase_a['summary']['tts_latency_ms']['mean'],
    phase_a['summary']['e2e_latency_ms']['mean'],
]
phase_b_means = [
    phase_b['summary']['stt_latency_ms']['mean'],
    phase_b['summary']['reasoning_latency_ms']['mean'],
    phase_b['summary']['tts_latency_ms']['mean'],
    phase_b['summary']['e2e_latency_ms']['mean'],
]

x = range(len(stages))
plt.bar([i - 0.2 for i in x], phase_a_means, width=0.4, label='Phase A (API)', color='blue')
plt.bar([i + 0.2 for i in x], phase_b_means, width=0.4, label='Phase B (Local)', color='green')
plt.xticks(x, stages)
plt.ylabel('Latency (ms)')
plt.title('Phase A vs Phase B Performance')
plt.legend()
plt.savefig('benchmark-comparison.png')
plt.show()
```

## Using Pre-Recorded Audio

For more accurate benchmarks, use pre-recorded Tamil audio files:

```bash
# Create test audio directory
mkdir test-audio

# Record 20 Tamil phrases (or synthesize via Google TTS)
# Save as: test-audio/phrase_01.wav, phrase_02.wav, ...

# Modify benchmark.py to use files:
# Edit run_e2e_benchmark() to accept audio_file parameter
```

## Continuous Benchmarking

```bash
# Run benchmark every hour
while true; do
    echo "$(date): Running benchmark..."
    python3 benchmark.py
    mv benchmark-results.json "benchmark-$(date +%Y%m%d-%H%M%S).json"
    sleep 3600
done
```

## Troubleshooting

### "Services not running"
```bash
./start-services.sh
# Wait 5 seconds
python3 benchmark.py
```

### "Import requests not found"
```bash
pip install requests
```

### "Benchmark too slow"
- **Phase A**: Check API keys, network latency
- **Phase B**: Use GPU (AWS g5.xlarge), or switch to smaller models

### "Tamil not recognized"
- Verify `locale="ta-IN"` in API calls
- Check whisper.cpp `-l ta` flag for Phase B

## Next Steps

1. **Baseline Phase A** (~10 min)
2. **Implement Phase B** (see `PHASE_TOGGLE_GUIDE.md`)
3. **Compare** results
4. **Optimize** based on bottlenecks
5. **Document** findings in `STATUS.md`

---

**Target**: ≤10s typical E2E turn time  
**Current Phase A**: ~4-6s ✅  
**Phase B (CPU)**: ~8-13s ⚠️  
**Phase B (GPU)**: ~2-4s ✅
