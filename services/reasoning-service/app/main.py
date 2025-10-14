from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import logging
import json
from pathlib import Path
from typing import Optional
import os

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)
from .reasoner import Reasoner, get_reasoner
from .safety import SafetyGuardrails

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reasoning Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Risk event log
RISK_LOG_PATH = Path("./risk-log.jsonl")
RISK_LOG_PATH.touch(exist_ok=True)

# Initialize providers
reasoner: Optional[Reasoner] = None
safety: Optional[SafetyGuardrails] = None


@app.on_event("startup")
async def startup():
    global reasoner, safety
    reasoner = get_reasoner()
    safety = SafetyGuardrails()
    logger.info(f"Reasoning service started with reasoner={type(reasoner).__name__}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "reasoning-service",
        "reasoner": os.getenv("REASONER", "server"),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


class RiskFlags(BaseModel):
    has_self_harm: bool = False
    has_medical_advice: bool = False
    needs_escalation: bool = False


class RespondRequest(BaseModel):
    session_id: str
    transcript_window: list[str]
    locale: str = "ta-IN"


class RespondResponse(BaseModel):
    reply_text: str
    risk_flags: RiskFlags
    processing_time_ms: int


@app.post("/respond", response_model=RespondResponse)
async def generate_response(request: RespondRequest):
    """
    Generate safe, supportive response with crisis detection.
    """
    start_time = datetime.utcnow()
    
    try:
        if not reasoner or not safety:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Combine transcript window
        user_input = " ".join(request.transcript_window)
        
        logger.info(f"Processing request for session {request.session_id}, input length: {len(user_input)}")
        
        # Pre-check: Crisis detection
        pre_check = safety.pre_check(user_input)
        
        if pre_check["is_high_risk"]:
            # Log risk event
            await log_risk_event({
                "session_id": request.session_id,
                "event_type": "high_risk_detected",
                "keywords": pre_check["keywords"],
                "transcript_snippet": user_input[:200],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            
            # Return crisis template
            reply_text = safety.get_crisis_template(request.locale)
            risk_flags = RiskFlags(
                has_self_harm=pre_check.get("self_harm", False),
                needs_escalation=True
            )
        else:
            # Generate LLM response
            reply_text = await reasoner.generate(
                user_input=user_input,
                conversation_history=request.transcript_window,
                locale=request.locale
            )
            
            # Post-check: Validate response
            post_check = safety.post_check(reply_text)
            
            if not post_check["is_safe"]:
                logger.warning(f"Unsafe LLM response detected: {post_check['issues']}")
                # Fallback to safe template
                reply_text = safety.get_supportive_template(request.locale)
            
            risk_flags = RiskFlags(
                has_self_harm=pre_check.get("self_harm", False),
                has_medical_advice=post_check.get("has_medical_advice", False),
                needs_escalation=pre_check.get("needs_escalation", False)
            )
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        
        logger.info(
            f"Response generated",
            extra={
                "session_id": request.session_id,
                "reply_length": len(reply_text),
                "risk_flags": risk_flags.dict(),
                "processing_time_ms": int(elapsed * 1000)
            }
        )
        
        return RespondResponse(
            reply_text=reply_text,
            risk_flags=risk_flags,
            processing_time_ms=int(elapsed * 1000)
        )
        
    except Exception as e:
        logger.error(f"Response generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Response generation failed: {str(e)}")


class RiskEvent(BaseModel):
    session_id: str
    event_type: str
    transcript_snippet: str
    timestamp: str
    keywords: list[str] = []


@app.post("/events/risk")
async def log_risk_event(event: dict):
    """Log risk event to local JSONL file"""
    try:
        with open(RISK_LOG_PATH, 'a') as f:
            f.write(json.dumps(event, ensure_ascii=False) + '\n')
        
        logger.warning(f"Risk event logged: {event['event_type']} for session {event['session_id']}")
        
        return {"status": "logged"}
        
    except Exception as e:
        logger.error(f"Failed to log risk event: {e}")
        raise HTTPException(status_code=500, detail="Failed to log event")
