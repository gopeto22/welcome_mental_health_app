"""
Safety guardrails for mental health support
"""
import re
from typing import Dict, List


class SafetyGuardrails:
    """Pre and post-check safety mechanisms"""
    
    def __init__(self):
        # Crisis keywords (Tamil and English)
        self.self_harm_keywords = [
            # Tamil
            "தற்கொலை", "சாகணும்", "மரணம்", "முடிக்க", "வெட்டிக்கொள்",
            # English fallback
            "suicide", "kill myself", "end it", "die", "death",
        ]
        
        self.harm_others_keywords = [
            "கொல்", "அடி", "தாக்க",
            "kill", "hurt", "attack", "violence"
        ]
        
        self.dissociation_keywords = [
            "யதார்த்தம் இல்லை", "குரல்கள்", "பார்க்கிறேன்",
            "not real", "voices", "seeing things", "hallucination"
        ]
    
    def pre_check(self, user_input: str) -> Dict:
        """
        Pre-check user input for crisis indicators.
        
        Returns:
            {
                "is_high_risk": bool,
                "keywords": list[str],
                "self_harm": bool,
                "harm_others": bool,
                "dissociation": bool,
                "needs_escalation": bool
            }
        """
        user_lower = user_input.lower()
        
        detected_keywords = []
        self_harm = False
        harm_others = False
        dissociation = False
        
        # Check self-harm
        for kw in self.self_harm_keywords:
            if kw.lower() in user_lower:
                detected_keywords.append(kw)
                self_harm = True
        
        # Check harm to others
        for kw in self.harm_others_keywords:
            if kw.lower() in user_lower:
                detected_keywords.append(kw)
                harm_others = True
        
        # Check dissociation
        for kw in self.dissociation_keywords:
            if kw.lower() in user_lower:
                detected_keywords.append(kw)
                dissociation = True
        
        is_high_risk = self_harm or harm_others or dissociation
        needs_escalation = is_high_risk
        
        return {
            "is_high_risk": is_high_risk,
            "keywords": detected_keywords,
            "self_harm": self_harm,
            "harm_others": harm_others,
            "dissociation": dissociation,
            "needs_escalation": needs_escalation
        }
    
    def post_check(self, llm_response: str) -> Dict:
        """
        Post-check LLM response for unsafe content.
        
        Returns:
            {
                "is_safe": bool,
                "issues": list[str],
                "has_medical_advice": bool
            }
        """
        issues = []
        has_medical_advice = False
        
        response_lower = llm_response.lower()
        
        # Check for diagnosis language
        diagnosis_keywords = [
            "நீங்கள்.*நோய்", "கோளாறு", "பிரச்சனை.*உள்ளது",
            "you have", "diagnosed with", "disorder", "condition"
        ]
        for pattern in diagnosis_keywords:
            if re.search(pattern, response_lower):
                issues.append("Contains diagnosis")
                has_medical_advice = True
        
        # Check for medication advice
        medication_keywords = [
            "மருந்து", "மாத்திரை", "எடுக்க வேண்டும்",
            "medication", "pill", "prescription", "take", "drug"
        ]
        for kw in medication_keywords:
            if kw.lower() in response_lower:
                issues.append("Contains medication advice")
                has_medical_advice = True
        
        # Check for dismissive language
        dismissive_patterns = [
            "வெறும்", "சாதாரண", "ஒன்றும் இல்லை",
            "just", "only", "nothing serious", "overreacting"
        ]
        for pattern in dismissive_patterns:
            if re.search(pattern, response_lower):
                issues.append("Contains dismissive language")
        
        is_safe = len(issues) == 0
        
        return {
            "is_safe": is_safe,
            "issues": issues,
            "has_medical_advice": has_medical_advice
        }
    
    def get_crisis_template(self, locale: str = "ta-IN") -> str:
        """Return crisis deflection template with helpline info"""
        if locale == "ta-IN":
            return """உங்கள் பாதுகாப்பு மிகவும் முக்கியம். தயவுசெய்து உடனடியாக உதவி பெறுங்கள்.

**தமிழ்நாடு மனநல ஹெல்ப்லைன்**: 044-46464646
**தேசிய நெருக்கடி ஹெல்ப்லைன்**: 9152987821

நீங்கள் தனியாக இல்லை. தொழில்முறை உதவி உங்களுக்குக் கிடைக்கும்."""
        else:
            return """Your safety is very important. Please seek immediate help.

**Tamil Nadu Mental Health Helpline**: 044-46464646
**National Crisis Helpline**: 9152987821

You are not alone. Professional help is available."""
    
    def get_supportive_template(self, locale: str = "ta-IN") -> str:
        """Return generic supportive template (fallback for unsafe LLM responses)"""
        if locale == "ta-IN":
            return """உங்கள் உணர்வுகளைப் பகிர்ந்ததற்கு நன்றி. நீங்கள் சரியான பாதையில் இருக்கிறீர்கள். தொழில்முறை ஆலோசகரிடம் பேசுவது உதவியாக இருக்கும்."""
        else:
            return """Thank you for sharing your feelings. You're taking the right step. Speaking with a professional counselor may be helpful."""
    
    def get_grounding_prompts(self, locale: str = "ta-IN") -> List[str]:
        """Return list of grounding prompts (for future use)"""
        if locale == "ta-IN":
            return [
                "ஐந்து விஷயங்களை நீங்கள் பார்க்கிறீர்களா?",
                "மூன்று விஷயங்களை நீங்கள் கேட்கிறீர்களா?",
                "உங்கள் மூச்சை கவனியுங்கள். மெதுவாக உள்ளே இழுக்கவும், வெளியே விடவும்.",
                "உங்கள் கால்களை தரையில் உணருங்கள்.",
                "இப்போது இந்த தருணத்தில் நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.",
                "உங்கள் உடலில் பதற்றம் இருக்கும் இடத்தை கவனியுங்கள்.",
                "மெதுவாக ஒன்று முதல் பத்து வரை எண்ணுங்கள்.",
                "உங்களை ஆதரிக்கும் ஒருவரை நினைத்துப் பாருங்கள்."
            ]
        else:
            return [
                "Can you notice five things you can see?",
                "Can you hear three things around you?",
                "Notice your breath. Slowly breathe in and out.",
                "Feel your feet on the ground.",
                "You are safe in this moment.",
                "Notice where you feel tension in your body.",
                "Count slowly from one to ten.",
                "Think of someone who supports you."
            ]
