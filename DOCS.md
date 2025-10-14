# 📖 Documentation Guide

## Where to Start

**New to this project?** Start here:

1. **[TRANSFORMATION.md](./TRANSFORMATION.md)** - Complete overview of what changed ⭐
2. **[README.md](./README.md)** - Quick start guide
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visual diagrams & data flows

**Ready to code?** Go here:

4. **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Step-by-step frontend cleanup guide ⭐
5. **[CHECKLIST.md](./CHECKLIST.md)** - Week 1 task list
6. **[PHASE_TOGGLE_GUIDE.md](./PHASE_TOGGLE_GUIDE.md)** - Switch between API and local providers ⭐

**Want details?** Check these:

7. **[STATUS.md](./STATUS.md)** - Current completion status
8. **[SUMMARY.md](./SUMMARY.md)** - High-level summary

**For clinicians & demos:**

9. **[CLINICIAN_DEMO.md](./CLINICIAN_DEMO.md)** - Demo flow for mental health professionals ⭐

**For benchmarking:**

10. **[benchmark.py](./benchmark.py)** - Performance testing script

## 📚 Document Overview

### [TRANSFORMATION.md](./TRANSFORMATION.md) ⭐ **START HERE**
**What:** Complete transformation summary  
**For:** Everyone  
**Length:** ~500 lines  
**Content:**
- What was built (before/after comparison)
- Complete file listings
- Privacy & safety architecture
- Code statistics
- Quick start (1 hour to working app)
- Phase A → Phase B transition plan

### [README.md](./README.md)
**What:** Project overview & quickstart  
**For:** Developers starting the project  
**Length:** ~150 lines  
**Content:**
- Architecture diagram
- Prerequisites
- Installation steps
- Run instructions
- Feature list
- Phase A vs Phase B

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**What:** Visual system design  
**For:** Technical understanding  
**Length:** ~400 lines  
**Content:**
- ASCII art UI diagrams
- Service interaction flows
- Data flow diagrams
- Privacy architecture
- Component interactions
- Latency targets

### [IMPLEMENTATION.md](./IMPLEMENTATION.md) ⭐ **FOR CODING**
**What:** Complete frontend migration guide  
**For:** Frontend developers  
**Length:** ~600 lines  
**Content:**
- Step-by-step cleanup instructions
- Complete code listings for new components
- What to keep, what to delete
- API client rewrite
- Migration checklist
- Testing instructions

### [CHECKLIST.md](./CHECKLIST.md)
**What:** Week 1 task list  
**For:** Project managers & developers  
**Length:** ~400 lines  
**Content:**
- Backend completion status (100% ✅)
- Frontend tasks (with checkboxes)
- Time estimates
- Acceptance criteria
- Known issues
- Launch sequence

### [STATUS.md](./STATUS.md)
**What:** Current project status  
**For:** Quick reference  
**Length:** ~250 lines  
**Content:**
- What's complete
- What's remaining
- Deliverables checklist
- Quick start commands
- Notes for different roles

### [SUMMARY.md](./SUMMARY.md)
**What:** High-level transformation summary  
**For:** Executives & stakeholders  
**Length:** ~500 lines  
**Content:**
- Major changes overview
- What was removed (Lovable)
- What was built (services)
- Code statistics
- Next steps

## 🎯 Quick Navigation by Role

### 👨‍💻 **Developer (Backend)**
1. Read [TRANSFORMATION.md](./TRANSFORMATION.md) (overview)
2. Read service READMEs:
   - [services/media-service/README.md](./services/media-service/README.md)
   - [services/speech-service/README.md](./services/speech-service/README.md)
   - [services/reasoning-service/README.md](./services/reasoning-service/README.md)
3. Get API keys (Groq + Google Cloud)
4. Configure `.env` files
5. Run `./start-services.sh`

### 👨‍💻 **Developer (Frontend)**
1. Read [TRANSFORMATION.md](./TRANSFORMATION.md) (overview)
2. **Follow [IMPLEMENTATION.md](./IMPLEMENTATION.md)** step-by-step ⭐
3. Read [frontend/README.md](./frontend/README.md)
4. Use clean `package.json`
5. Create 4 new components
6. Test with backend running

### 👨‍💼 **Project Manager**
1. Read [TRANSFORMATION.md](./TRANSFORMATION.md) (overview)
2. Review [CHECKLIST.md](./CHECKLIST.md) (tasks)
3. Check [STATUS.md](./STATUS.md) (current state)
4. Track Week 1 acceptance criteria

### 🏥 **Clinician**
1. Read [TRANSFORMATION.md](./TRANSFORMATION.md) (overview)
2. Review safety guardrails in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Edit crisis templates in `services/reasoning-service/app/safety.py`
4. Update helpline numbers as needed
5. Add more grounding prompts (Tamil)

### 🔧 **DevOps**
1. Read [README.md](./README.md) (setup)
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (system design)
3. Check service requirements.txt files
4. Note: All services stateless (except logs)
5. Update CORS for production

### 🎨 **Designer**
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (UI diagrams)
2. Review accessibility requirements
3. Check color scheme (neutral with purple accent)
4. Ensure touch targets ≥24px
5. High contrast requirement (4.5:1)

## 📂 Service Documentation

### Media Service
- **Location:** `services/media-service/README.md`
- **Port:** 8001
- **Purpose:** Audio chunk upload & coordination
- **Endpoints:** `/media/chunk-upload`, `/health`

### Speech Service
- **Location:** `services/speech-service/README.md`
- **Port:** 8002
- **Purpose:** STT & TTS for Tamil
- **Endpoints:** `/stt/chunk`, `/tts/speak`, `/audio/cache/:id`, `/health`

### Reasoning Service
- **Location:** `services/reasoning-service/README.md`
- **Port:** 8003
- **Purpose:** LLM + safety guardrails
- **Endpoints:** `/respond`, `/events/risk`, `/health`

## 🎓 Learning Path

### Day 1: Understanding
1. [TRANSFORMATION.md](./TRANSFORMATION.md) - See what changed
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand system design
3. [README.md](./README.md) - Quick start overview

### Day 2: Backend Setup
1. Install Python dependencies
2. Get API keys
3. Configure `.env` files
4. Start services
5. Test with `curl`

### Day 3: Frontend Cleanup
1. Follow [IMPLEMENTATION.md](./IMPLEMENTATION.md)
2. Update configs
3. Create new components
4. Test integration

### Day 4: Testing & Polish
1. Use [CHECKLIST.md](./CHECKLIST.md)
2. Test all acceptance criteria
3. Fix issues
4. Document any changes

## 🔍 Finding Specific Information

**Need to know...**

- **How to start services?** → [README.md](./README.md) or `./start-services.sh`
- **How to clean frontend?** → [IMPLEMENTATION.md](./IMPLEMENTATION.md) ⭐
- **How does safety work?** → [ARCHITECTURE.md](./ARCHITECTURE.md) + `services/reasoning-service/app/safety.py`
- **What's the data flow?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **What's done vs remaining?** → [STATUS.md](./STATUS.md) or [CHECKLIST.md](./CHECKLIST.md)
- **How to get API keys?** → [TRANSFORMATION.md](./TRANSFORMATION.md) or service READMEs
- **What changed from Lovable?** → [TRANSFORMATION.md](./TRANSFORMATION.md)
- **How to add crisis keywords?** → `services/reasoning-service/app/safety.py`
- **How to update helplines?** → Same file + `CrisisHelp` component
- **What's Phase A vs B?** → Any README or [TRANSFORMATION.md](./TRANSFORMATION.md)

## 📊 Documentation Statistics

| File | Lines | Words | Purpose |
|------|-------|-------|---------|
| TRANSFORMATION.md | ~500 | ~3500 | Complete overview ⭐ |
| IMPLEMENTATION.md | ~600 | ~4000 | Frontend guide ⭐ |
| ARCHITECTURE.md | ~400 | ~2500 | System design |
| CHECKLIST.md | ~400 | ~2000 | Task list |
| STATUS.md | ~250 | ~1500 | Current state |
| SUMMARY.md | ~500 | ~3500 | High-level summary |
| README.md | ~150 | ~1000 | Quick start |
| Service READMEs | ~300 | ~2000 | API docs |
| **Total** | **~3100** | **~20000** | **8 docs** |

## ✨ Quick Command Reference

```bash
# Start all services
./start-services.sh

# Stop all services
./stop-services.sh

# Check service health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health

# Install backend dependencies
cd services/media-service && pip install -r requirements.txt
cd ../speech-service && pip install -r requirements.txt
cd ../reasoning-service && pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

# Start frontend
npm run dev
```

## 🎯 Document Reading Order

### **Quick Start (30 min)**
1. [TRANSFORMATION.md](./TRANSFORMATION.md) - Overview (10 min)
2. [README.md](./README.md) - Setup commands (5 min)
3. [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Frontend tasks (15 min)

### **Deep Dive (2 hours)**
1. [TRANSFORMATION.md](./TRANSFORMATION.md) - Complete overview (20 min)
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design (30 min)
3. [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Code guide (30 min)
4. Service READMEs - API details (30 min)
5. [CHECKLIST.md](./CHECKLIST.md) - Task list (10 min)

### **Reference (Ongoing)**
- [STATUS.md](./STATUS.md) - Check progress
- [CHECKLIST.md](./CHECKLIST.md) - Track tasks
- Service READMEs - API reference

---

## 🚀 **Start Here for Fastest Results:**

1. **[TRANSFORMATION.md](./TRANSFORMATION.md)** - 10 min read
2. Get API keys - 10 min
3. **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Follow step-by-step - 30 min
4. Test - 10 min

**Total: 1 hour to working app** ⏱️

---

**All documentation is complete and ready. Backend is 100% done. Frontend needs 30 min cleanup.**

---

## 🆕 Latest Additions

### [PHASE_TOGGLE_GUIDE.md](./PHASE_TOGGLE_GUIDE.md) ⭐
**What:** Complete guide to switching between Phase A (API) and Phase B (local) providers  
**Length:** ~400 lines  
**Content:**
- Environment variable toggles
- whisper.cpp integration steps
- System TTS setup (iOS/Android/macOS)
- MLC-LLM local reasoning setup
- Performance comparison table
- HTTP contract stability guarantees

### [CLINICIAN_DEMO.md](./CLINICIAN_DEMO.md) ⭐
**What:** Demo flow for mental health professionals  
**Length:** ~350 lines  
**Content:**
- 5-minute demo setup
- 5 test scenarios (anxiety, crisis, safety filters)
- Risk log review instructions
- Safety guardrails explained
- Limitations and transparency guidelines
- FAQ for clinical staff

### [benchmark.py](./benchmark.py)
**What:** Performance benchmark script  
**Usage:** `python3 benchmark.py` (requires services running)  
**Content:**
- 20 Tamil test utterances
- STT/Reasoning/TTS latency measurement
- E2E turn time analysis
- P95/P99 percentiles
- Tokens/sec throughput
- JSON output for analysis
