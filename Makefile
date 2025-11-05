.PHONY: help up down demo eval test clean

help:
	@echo "Mental AI Assistant - Makefile Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make up      - Start all backend services"
	@echo "  make down    - Stop all backend services"
	@echo "  make demo    - Run scripted 3-turn demo"
	@echo "  make eval    - Run Phase A evaluation"
	@echo "  make test    - Run red-team safety tests"
	@echo "  make clean   - Clean logs and temp files"
	@echo ""

up:
	@echo "🚀 Starting all services..."
	@./start-services.sh

down:
	@echo "🛑 Stopping all services..."
	@./stop-services.sh

demo:
	@echo "🎭 Running scripted demo (3 turns)..."
	@python3 scripts/demo_scripted.py

eval:
	@echo "📊 Running Phase A evaluation..."
	@python3 scripts/eval_phase_a.py --input assets/audio_v0/
	@echo ""
	@echo "✅ Evaluation complete. See benchmarks/phase_a_summary.md"

test:
	@echo "🔒 Running red-team safety tests..."
	@pytest services/reasoning-service/test_red_team.py -v
	@echo ""
	@echo "✅ Safety tests complete."

clean:
	@echo "🧹 Cleaning logs and temp files..."
	@rm -rf logs/*.log
	@rm -rf services/*/audio_cache/*.mp3
	@rm -rf services/*/audio_chunks/*.webm
	@echo "✅ Cleanup complete."
