"""
Crisis routing and keyword matching for safety-critical scenarios.
Routes high-risk inputs to pre-written templates, bypassing LLM generation.
"""
import re
from typing import Dict, Tuple, Literal
from .safety import SafetyGuardrails


IntentType = Literal["explicit_self_harm", "abuse_disclosure", "uncertain", "safe"]


class CrisisRouter:
    """Routes conversation based on crisis detection"""
    
    def __init__(self):
        self.safety = SafetyGuardrails()
        
        # EXPLICIT SELF-HARM INTENT (highest priority)
        # These indicate direct suicidal/self-harm thoughts
        self.tamil_self_harm = [
            "தற்கொலை",  # suicide
            "சாகணும்",  # want to die
            "சாக விரும்பு",  # want to die
            "வெட்டிக்கொள்",  # cut myself
            "கொல்ல விரும்பு",  # want to kill (myself)
            "தூக்கில்",  # hanging
            "தூக்குப்போட",  # hang (myself)
            "முடிச்சிக்க",  # end (it all)
        ]
        
        self.english_self_harm = [
            "suicide",
            "kill myself",
            "end it all",
            "want to die",
            "better off dead",
            "hang myself",
            "overdose",
            "cut myself",
            "hurt myself",
            "end my life",
            "no reason to live",
            "going to die",
        ]
        
        # ABUSE DISCLOSURE PATTERNS
        # These need supportive response, NOT crisis escalation
        self.tamil_abuse_indicators = [
            "அடிக்கிறார்",  # beats me
            "அடிக்கிறான்",  # beats me (male)
            "தாக்குகிறார்",  # attacks me
            "துன்புறுத்துகிறார்",  # harasses me
            "வன்முறை",  # violence (from others)
        ]
        
        self.english_abuse_indicators = [
            "beats me",
            "hits me",
            "attacks me",
            "hurts me",  # when referring to others
            "abuses me",
            "threatens me",
        ]
        
        # UNCERTAIN CONTEXT CLUES
        # These require C-SSRS-style clarifying question
        self.tamil_uncertain = [
            "வலி",  # pain (could be physical or emotional)
            "தாங்க முடியல",  # can't bear (ambiguous)
            "போதும்",  # enough (context needed)
        ]
        
        self.english_uncertain = [
            "can't take it anymore",
            "can't take this anymore",
            "can't go on",
            "had enough",
            "want it to stop",
            "want this to stop",
        ]
        
        # Transliterated Tamil (common spellings)
        self.transliterated_keywords = [
            "tharkkolai",  # தற்கொலை
            "tharkolai",
            "saganum",  # சாகணும்
            "saaganum",
            "maranam",  # மரணம்
            "vettikkol",  # வெட்டிக்கொள்
            "kollanum",  # கொல்லணும்
        ]
    
    def analyze_intent(self, text: str) -> IntentType:
        """
        Distinguish between explicit self-harm, abuse disclosure, uncertain, and safe.
        
        Decision logic:
        1. If explicit self-harm keywords → "explicit_self_harm"
        2. If abuse indicators WITHOUT self-harm → "abuse_disclosure"
        3. If uncertain keywords only → "uncertain" (needs C-SSRS prompt)
        4. Otherwise → "safe"
        """
        if not text:
            return "safe"
        
        text_lower = text.lower()
        
        # Check for EXPLICIT SELF-HARM first (highest priority)
        has_self_harm = False
        
        # Tamil self-harm keywords
        for keyword in self.tamil_self_harm:
            if keyword.lower() in text_lower:
                has_self_harm = True
                break
        
        # English self-harm keywords with word boundaries
        if not has_self_harm:
            for keyword in self.english_self_harm:
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    has_self_harm = True
                    break
        
        # Transliterated self-harm
        if not has_self_harm:
            for keyword in self.transliterated_keywords:
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, text_lower):
                    has_self_harm = True
                    break
        
        # If explicit self-harm found, return immediately
        if has_self_harm:
            return "explicit_self_harm"
        
        # Check for ABUSE DISCLOSURE (supportive, not crisis)
        has_abuse = False
        
        # Tamil abuse indicators
        for keyword in self.tamil_abuse_indicators:
            if keyword.lower() in text_lower:
                has_abuse = True
                break
        
        # English abuse indicators with word boundaries
        if not has_abuse:
            for keyword in self.english_abuse_indicators:
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    has_abuse = True
                    break
        
        if has_abuse:
            return "abuse_disclosure"
        
        # Check for UNCERTAIN CONTEXT (needs clarification)
        has_uncertain = False
        
        # Tamil uncertain keywords
        for keyword in self.tamil_uncertain:
            if keyword.lower() in text_lower:
                has_uncertain = True
                break
        
        # English uncertain keywords
        if not has_uncertain:
            for keyword in self.english_uncertain:
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    has_uncertain = True
                    break
        
        if has_uncertain:
            return "uncertain"
        
        return "safe"
    
    def get_uncertainty_prompt(self, locale: str) -> str:
        """
        Return C-SSRS-style plain-language screening question.
        Used when intent is unclear.
        """
        if locale.startswith('ta'):
            return (
                "நான் உங்களை சரியாக புரிந்துகொண்டேனா என்பதை உறுதிப்படுத்த விரும்புகிறேன். "
                "நீங்கள் உங்களை காயப்படுத்திக் கொள்ள அல்லது உங்கள் வாழ்க்கையை முடிக்க நினைக்கிறீர்களா?"
            )
        else:  # English
            return (
                "I want to make sure I understand you correctly. "
                "Are you thinking of hurting yourself or ending your life?"
            )
    
    def get_supportive_response(self, locale: str) -> str:
        """
        Return supportive (non-crisis) template for abuse disclosure.
        Validates feelings, offers support, signposts non-emergency resources.
        """
        if locale.startswith('ta'):
            return (
                "நீங்கள் அனுபவித்து வருவது மிகவும் கடினமானது என்பதை நான் புரிந்துகொள்கிறேன். "
                "நீங்கள் பாதுகாப்பாக உணர வேண்டியது முக்கியம். "
                "உங்கள் உணர்வுகளைப் பகிர்ந்து கொண்டதற்கு நன்றி. "
                "\n\nதமிழ்நாடு பெண்கள் உதவி எண்: 181 (24/7)"
            )
        else:  # English
            return (
                "I hear you, and I understand that what you're experiencing is very difficult. "
                "Your safety and wellbeing are important. "
                "Thank you for trusting me with this. "
                "\n\nTamil Nadu Women's Helpline: 181 (24/7)"
            )
    
    def matches_explicit_crisis(self, text: str) -> bool:
        """
        DEPRECATED: Use analyze_intent() instead.
        Kept for backward compatibility.
        """
        return self.analyze_intent(text) == "explicit_self_harm"
    
    def route_response(
        self, 
        user_input: str, 
        locale: str = "ta-IN"
    ) -> Tuple[str, Dict]:
        """
        Route conversation based on intent analysis.
        
        Decision table:
        - explicit_self_harm → Crisis template, needs_escalation=True
        - abuse_disclosure → Supportive template, needs_escalation=False
        - uncertain → C-SSRS prompt, log to risk-log.jsonl
        - safe → None (proceed with LLM)
        
        Returns:
            (reply_text, risk_flags) tuple
            - If routed: returns template and risk flags
            - If safe: returns (None, flags) to proceed with LLM
        """
        # Analyze intent with contextual logic
        intent = self.analyze_intent(user_input)
        
        # Route based on intent classification
        if intent == "explicit_self_harm":
            # Use crisis template immediately
            template = self.safety.get_crisis_template(locale)
            risk_flags = {
                "has_self_harm": True,
                "has_medical_advice": False,
                "needs_escalation": True,
                "intent_type": "explicit_self_harm",
            }
            return (template, risk_flags)
        
        elif intent == "abuse_disclosure":
            # Use supportive (non-crisis) template
            template = self.get_supportive_response(locale)
            risk_flags = {
                "has_self_harm": False,
                "has_medical_advice": False,
                "needs_escalation": False,  # Not immediate crisis
                "intent_type": "abuse_disclosure",
                "requires_followup": True,  # Flag for monitoring
            }
            return (template, risk_flags)
        
        elif intent == "uncertain":
            # Use C-SSRS-style screening question
            template = self.get_uncertainty_prompt(locale)
            risk_flags = {
                "has_self_harm": False,
                "has_medical_advice": False,
                "needs_escalation": False,
                "intent_type": "uncertain",
                "awaiting_clarification": True,  # Track for next turn
            }
            return (template, risk_flags)
        
        # Safe - do full safety pre-check before LLM
        pre_check_result = self.safety.pre_check(user_input)
        
        if pre_check_result.get("needs_escalation", False):
            # Escalation detected by broader safety guardrails
            template = self.safety.get_crisis_template(locale)
            risk_flags = {
                "has_self_harm": pre_check_result.get("has_self_harm", False),
                "has_medical_advice": pre_check_result.get("has_medical_advice", False),
                "needs_escalation": True,
                "intent_type": "safety_guardrail_triggered",
            }
            return (template, risk_flags)
        
        # No routing needed - proceed with LLM
        pre_check_result["intent_type"] = "safe"
        return (None, pre_check_result)
