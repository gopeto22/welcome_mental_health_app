/**
 * Enhanced API Client for Mobile Frontend
 * Includes retry logic, error handling, and mobile-optimized requests
 */

import type {
  RespondRequest,
  RespondResponse,
  STTRequest,
  STTResponse,
  TTSRequest,
  TTSResponse,
  Locale,
} from "@/types/mobile";
import { DEMO_MODE, getDemoResponse } from "./demoMode";

const SPEECH_SERVICE_URL = import.meta.env.VITE_SPEECH_SERVICE_URL || "http://localhost:8002";
const REASONING_SERVICE_URL = import.meta.env.VITE_REASONING_SERVICE_URL || "http://localhost:8003";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Utility: Sleep function for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Retry wrapper with exponential backoff
async function retryFetch<T>(
  fetcher: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * POST /respond (Reasoning Service)
 * Generate AI response with safety checks
 */
export async function postRespond(request: RespondRequest): Promise<RespondResponse> {
  // Use demo mode if backend not configured
  if (DEMO_MODE) {
    console.log("🎭 Demo mode: Using simulated AI response");
    const userInput = request.transcript_window[request.transcript_window.length - 1]?.replace(/^user:\s*/i, '') || '';
    return getDemoResponse(userInput, request.transcript_window);
  }
  
  return retryFetch(async () => {
    const response = await fetch(`${REASONING_SERVICE_URL}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Response generation failed" }));
      throw new Error(error.detail || "Failed to generate response");
    }

    return response.json();
  });
}

/**
 * POST /stt (Speech Service)
 * Convert audio to text
 */
export async function postSTT(request: STTRequest): Promise<STTResponse> {
  return retryFetch(async () => {
    const formData = new FormData();
    formData.append("file", request.audio, "recording.webm");
    formData.append("locale", request.locale);

    const response = await fetch(`${SPEECH_SERVICE_URL}/stt/chunk`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "STT failed" }));
      throw new Error(error.detail || "Failed to transcribe audio");
    }

    const data = await response.json();
    return {
      text: data.text || data.transcript,
      confidence: data.confidence,
    };
  });
}

/**
 * POST /tts (Speech Service)
 * Convert text to audio
 */
export async function postTTS(request: TTSRequest): Promise<TTSResponse> {
  return retryFetch(async () => {
    const voice = request.voice || getDefaultVoice(request.locale);
    
    const response = await fetch(`${SPEECH_SERVICE_URL}/tts/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: request.text,
        voice,
        locale: request.locale,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "TTS failed" }));
      throw new Error(error.detail || "Failed to generate speech");
    }

    const data = await response.json();
    return {
      url: `${SPEECH_SERVICE_URL}${data.file_url}`,
      duration_ms: data.duration_ms,
    };
  });
}

/**
 * Check service health
 */
export async function checkServiceHealth(): Promise<{
  speech: boolean;
  reasoning: boolean;
}> {
  try {
    const [speechHealth, reasoningHealth] = await Promise.allSettled([
      fetch(`${SPEECH_SERVICE_URL}/health`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      }).then(r => r.ok).catch(() => false),
      fetch(`${REASONING_SERVICE_URL}/health`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      }).then(r => r.ok).catch(() => false),
    ]);

    return {
      speech: speechHealth.status === 'fulfilled' && speechHealth.value,
      reasoning: reasoningHealth.status === 'fulfilled' && reasoningHealth.value,
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      speech: false,
      reasoning: false,
    };
  }
}

/**
 * Get default voice for locale
 */
function getDefaultVoice(locale: Locale): string {
  switch (locale) {
    case "en-GB":
      return "en-GB-Wavenet-C";
    case "ta-IN":
      return "ta-IN-Standard-A";
    default:
      return "en-GB-Wavenet-C";
  }
}

/**
 * Track analytics event (console logging for pilot)
 */
export function trackEvent(event: Record<string, unknown>): void {
  console.log("[Analytics]", event);
  // TODO: POST to analytics endpoint if available
}
