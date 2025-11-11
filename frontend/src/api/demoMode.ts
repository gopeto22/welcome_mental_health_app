/**
 * Demo Mode Responses
 * Used when backend services are not available
 */

import type { RespondResponse, RiskFlags } from "@/types/mobile";

// Check if we're in demo mode (no backend configured)
export const DEMO_MODE = !import.meta.env.VITE_REASONING_SERVICE_URL || 
                         import.meta.env.VITE_DEMO_MODE === "true";

export function getDemoResponse(userInput: string, conversationHistory: string[]): RespondResponse {
  const userLower = userInput.toLowerCase();
  
  // Crisis keywords detection
  const crisisKeywords = ["hurt myself", "kill myself", "end it", "suicide", "die", "harm myself"];
  if (crisisKeywords.some(keyword => userLower.includes(keyword))) {
    return {
      reply_text: "I'm really concerned about what you've shared. Your safety is the most important thing right now.",
      risk_flags: {
        has_self_harm: true,
        has_medical_advice: false,
        needs_escalation: true,
      },
      processing_time_ms: 100,
    };
  }
  
  // Trauma/PTSD symptoms
  if (["flashback", "nightmare", "reliving", "trauma", "triggered"].some(w => userLower.includes(w))) {
    const responses = [
      "I'm sorry you're experiencing this flashback. That must be really frightening. You're safe right now. Can you tell me what you're noticing in your body?",
      "Nightmares can be so distressing, especially when they bring back difficult memories. I'm here with you. Would it help to talk about what you're experiencing?",
      "Thank you for telling me about this. When we have flashbacks or nightmares, it can feel very overwhelming. What would help you feel more grounded right now?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Physical distress
  if (["unwell", "sick", "nauseous", "dizzy", "shaking", "trembling", "chest pain", "can't breathe"].some(w => userLower.includes(w))) {
    const responses = [
      "I hear that you're feeling physically unwell. Sometimes our bodies hold a lot of stress. Can you describe what you're experiencing?",
      "It sounds like you're noticing some physical symptoms. That can be really uncomfortable. Are you somewhere safe right now?",
      "Thank you for sharing that. Physical symptoms can be a sign that our body is responding to stress. What sensations are you noticing?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Anxiety/fear
  if (["worried", "anxious", "nervous", "scared", "afraid", "panic", "overwhelmed"].some(w => userLower.includes(w))) {
    const responses = [
      "I hear that you're feeling worried. That's a really difficult feeling to sit with. Can you tell me more about what's making you feel this way?",
      "It sounds like anxiety is really present for you right now. That takes a lot of courage to share. What thoughts are coming up for you?",
      "I understand you're feeling anxious. Let's take this step by step together. What would help you feel even a little bit safer right now?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Depression/low mood
  if (["sad", "depressed", "down", "hopeless", "empty", "numb", "worthless"].some(w => userLower.includes(w))) {
    const responses = [
      "I'm hearing that you're feeling really low right now. Thank you for trusting me with this. Can you help me understand what's been happening?",
      "It sounds like things feel heavy for you at the moment. I'm here with you. What's been the hardest part?",
      "That sounds really difficult to carry. You don't have to go through this alone. Would it help to talk about what's contributing to these feelings?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Anger/frustration
  if (["angry", "frustrated", "mad", "irritated", "rage", "furious"].some(w => userLower.includes(w))) {
    const responses = [
      "I can hear that you're feeling frustrated. Those feelings are completely valid. What's been triggering this anger?",
      "It sounds like something has really upset you. Thank you for sharing that with me. Can you tell me more about what happened?",
      "I understand you're feeling angry. That emotion is telling us something important. What do you think it's connected to?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Positive/improvement
  if (["better", "improving", "helped"].some(w => userLower.includes(w)) && 
      !["not", "no", "never", "can't"].some(w => userLower.includes(w))) {
    const responses = [
      "I'm glad to hear things feel a bit better. What's changed for you?",
      "That's good to hear. What helped you feel this way?",
      "I'm pleased things are feeling more manageable. What's been helpful?",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Request for exercises
  if (["exercise", "breathing", "grounding", "calm down", "relax"].some(w => userLower.includes(w))) {
    const responses = [
      "That's a wonderful idea to try a grounding exercise. You can find some options in the exercises section. Would you like to try one now?",
      "Grounding exercises can be really helpful when we're feeling overwhelmed. I have some audio exercises available if you'd like to try them.",
      "Yes, let's try a grounding technique. The exercises section has some guided activities that might help you feel more present.",
    ];
    return createResponse(responses, conversationHistory);
  }
  
  // Default responses
  const responses = [
    "Thank you for sharing that with me. I'm here to listen. Can you tell me more about how you're feeling?",
    "I hear you. What's on your mind right now?",
    "I'm listening. How can I support you in this moment?",
    "That's important information. How are you coping with all of this?",
  ];
  return createResponse(responses, conversationHistory);
}

function createResponse(responses: string[], conversationHistory: string[]): RespondResponse {
  const responseIdx = conversationHistory.length % responses.length;
  const riskFlags: RiskFlags = {
    has_self_harm: false,
    has_medical_advice: false,
    needs_escalation: false,
  };
  
  return {
    reply_text: responses[responseIdx],
    risk_flags: riskFlags,
    processing_time_ms: 100,
  };
}
