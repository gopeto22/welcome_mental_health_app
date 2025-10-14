#!/bin/bash
# Start service with venv Python
exec venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8003
