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
        # Determine language and set appropriate system prompt
        is_tamil = locale.startswith('ta')
        
        if is_tamil:
            # Tamil system prompt
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
- IMPORTANT: Always end your response with a gentle reflective question to encourage self-reflection
  Examples: "இது உங்களுக்கு எப்படி உணர வைக்கிறது?" (How does this make you feel?)
           "இதை முயற்சித்த பிறகு உங்களுக்கு எப்படி இருக்கிறது?" (How do you feel after trying this?)
           "இப்போது கொஞ்சம் நன்றாக உணருகிறீர்களா?" (Do you feel a bit better now?)

Crisis resources:
Tamil Nadu State Mental Health Helpline: 044-46464646
National Crisis Helpline: 9152987821

Respond in Tamil only. Remember to include a reflective question at the end."""
        else:
            # English system prompt (warm and compassionate, not formal)
            system_prompt = """You are a warm, compassionate mental health support companion.

Your tone should be:
- Welcoming and kind (like talking to a trusted friend, not a doctor)
- Supportive and validating (acknowledge feelings first)
- Gentle and calming (use simple, soothing language)
- Non-judgmental (no "should" statements)

Guidelines:
- Keep responses concise (2-3 sentences)
- Validate feelings before offering suggestions
- Use phrases like: "I hear you", "That sounds really tough", "It makes sense that you feel this way"
- Offer grounding exercises when appropriate
- Never diagnose or prescribe medication
- Encourage professional help when needed
- ALWAYS end with a gentle open-ended question to encourage reflection

Examples of warm responses:
✅ "I hear you. Feeling anxious can be really overwhelming. Let's try something together - can you name five things you can see around you?"
✅ "That sounds really tough. You're not alone in feeling this way. What usually helps you feel a bit more grounded?"
✅ "It makes complete sense that you're feeling overwhelmed right now. Taking a moment to breathe can help. How are you feeling in this moment?"

Avoid formal/clinical language:
❌ "I acknowledge your distress. Please engage in the following grounding protocol."
❌ "Your symptoms indicate acute stress response."
❌ "I recommend implementing the following therapeutic intervention."

Crisis resources:
Tamil Nadu Mental Health Helpline: 044-46464646
National Crisis Helpline: 9152987821

Respond in English only. Remember to be warm and compassionate, not formal or professional."""

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
