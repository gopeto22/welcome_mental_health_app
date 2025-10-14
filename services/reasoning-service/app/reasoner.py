"""
Reasoner abstraction for Phase A (server LLM) and Phase B (local model)
"""
from abc import ABC, abstractmethod
import os
from groq import Groq


class Reasoner(ABC):
    @abstractmethod
    async def generate(
        self,
        user_input: str,
        conversation_history: list[str],
        locale: str = "ta-IN"
    ) -> str:
        """
        Generate supportive response.
        
        Returns:
            Response text in Tamil
        """
        pass


class GroqReasoner(Reasoner):
    """Phase A: Groq Llama-3.3-70B API"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment")
        self.client = Groq(api_key=api_key)
    
    async def generate(
        self,
        user_input: str,
        conversation_history: list[str],
        locale: str = "ta-IN"
    ) -> str:
        # System prompt for mental health support
        system_prompt = """You are a compassionate mental health support assistant for Tamil-speaking users.

Guidelines:
- Be warm, supportive, and non-judgmental
- Use simple, clear Tamil language
- Keep responses concise (2-3 sentences)
- Focus on validation and active listening
- Never diagnose or prescribe medication
- Never provide medical advice
- Encourage professional help when needed
- If user expresses crisis (self-harm, suicide), provide helpline info

Crisis resources:
Tamil Nadu State Mental Health Helpline: 044-46464646
National Crisis Helpline: 9152987821

Respond in Tamil only."""

        # Build conversation messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add recent history (last 5 exchanges to keep context manageable)
        history_window = conversation_history[-10:]  # Last 10 messages
        for i, msg in enumerate(history_window):
            role = "user" if i % 2 == 0 else "assistant"
            messages.append({"role": role, "content": msg})
        
        # Add current user input
        messages.append({"role": "user", "content": user_input})
        
        # Generate response
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=200,  # Keep responses concise
            top_p=0.9
        )
        
        reply = response.choices[0].message.content.strip()
        return reply


class LocalReasoner(Reasoner):
    """Phase B: Local quantized model via llama.cpp or MLC-LLM"""
    
    def __init__(self):
        model_path = os.getenv("LOCAL_MODEL_PATH")
        if not model_path:
            raise ValueError("LOCAL_MODEL_PATH not set for local reasoner")
        # TODO: Initialize local model
        raise NotImplementedError("Phase B: Local reasoning not yet implemented")
    
    async def generate(
        self,
        user_input: str,
        conversation_history: list[str],
        locale: str = "ta-IN"
    ) -> str:
        # TODO: Run local model inference with templated prompts
        raise NotImplementedError("Phase B: Local reasoning not yet implemented")


def get_reasoner() -> Reasoner:
    """Factory function to get configured reasoner"""
    reasoner_type = os.getenv("REASONER", "server")
    
    if reasoner_type == "server":
        return GroqReasoner()
    elif reasoner_type == "local":
        return LocalReasoner()
    else:
        raise ValueError(f"Unknown REASONER: {reasoner_type}")
