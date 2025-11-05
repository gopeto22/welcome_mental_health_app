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
from .safety_router import CrisisRouter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reasoning Service", version="1.0.0")

# CORS - allow frontend on multiple ports for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8001",
        "http://localhost:8081",
        "http://localhost:8082",
    ],
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
crisis_router: Optional[CrisisRouter] = None


@app.on_event("startup")
async def startup():
    global reasoner, safety, crisis_router
    reasoner = get_reasoner()
    safety = SafetyGuardrails()
    crisis_router = CrisisRouter()
    logger.info(f"Reasoning service started with reasoner={type(reasoner).__name__}")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "reasoning"}


@app.post("/events/session")
async def log_session_metrics(data: dict):
    """
    Log session-level metrics including SUDS improvement.
    
    Expected payload:
    {
        "session_id": "abc123",
        "suds_start": 7,
        "suds_end": 3,
        "message_count": 8,
        "duration_seconds": 240,
        "timestamp": "2025-01-15T10:30:00Z"
    }
    """
    import json
    from pathlib import Path
    from datetime import datetime
    
    # Calculate SUDS delta
    suds_delta = data.get("suds_start", 0) - data.get("suds_end", 0)
    
    # Enrich log entry
    log_entry = {
        **data,
        "suds_delta": suds_delta,
        "improvement": suds_delta > 0,
        "logged_at": datetime.utcnow().isoformat(),
    }
    
    # Append to session log
    log_file = Path("session-log.jsonl")
    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    logger.info(f"Session metrics logged: {data['session_id']} (SUDS Δ: {suds_delta})")
    
    return {"status": "logged", "suds_delta": suds_delta}


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
        if not reasoner or not safety or not crisis_router:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Combine transcript window
        user_input = " ".join(request.transcript_window)
        
        logger.info(f"Processing request for session {request.session_id}, input length: {len(user_input)}")
        
        # Use crisis router for immediate crisis detection
        crisis_response, crisis_flags_dict = crisis_router.route_response(user_input, request.locale)
        
        if crisis_response:
            # Crisis detected - use template immediately
            # Log risk event
            await log_risk_event({
                "session_id": request.session_id,
                "event_type": "crisis_detected",
                "keywords": ["crisis_keyword_match"],
                "transcript_snippet": user_input[:200],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
            
            # Return crisis template
            reply_text = crisis_response
            risk_flags = RiskFlags(
                has_self_harm=crisis_flags_dict.get("has_self_harm", False),
                has_medical_advice=crisis_flags_dict.get("has_medical_advice", False),
                needs_escalation=crisis_flags_dict.get("needs_escalation", True)
            )
        else:
            # No crisis - generate LLM response
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
                has_self_harm=crisis_flags_dict.get("has_self_harm", False),
                has_medical_advice=post_check.get("has_medical_advice", False),
                needs_escalation=crisis_flags_dict.get("needs_escalation", False)
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
