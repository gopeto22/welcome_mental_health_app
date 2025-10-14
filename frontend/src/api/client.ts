// API Client for Mental AI Assistant
// Uses fetch() and communicates with 3 local FastAPI services

const MEDIA_SERVICE_URL = import.meta.env.VITE_MEDIA_SERVICE_URL || "http://localhost:8001";
const SPEECH_SERVICE_URL = import.meta.env.VITE_SPEECH_SERVICE_URL || "http://localhost:8002";
const REASONING_SERVICE_URL = import.meta.env.VITE_REASONING_SERVICE_URL || "http://localhost:8003";

export interface RiskFlags {
  hasSelfHarm: boolean;
  hasMedicalAdvice: boolean;
  needsEscalation: boolean;
}

export interface TranscriptResponse {
  transcript: string;
  timing_ms: number;
}

export interface ReasoningResponse {
  response: string;
  riskFlags: RiskFlags;
  usedTemplate: boolean;
  timing_ms: number;
}

export interface TTSResponse {
  audioId: string;
  audioUrl: string;
  cached: boolean;
  timing_ms: number;
}

// Media Service: Upload audio chunk for transcription
export async function uploadAudioChunk(
  sessionId: string,
  sequenceIndex: number,
  audioBlob: Blob
): Promise<TranscriptResponse> {
  const formData = new FormData();
  formData.append("file", audioBlob, `chunk_${sequenceIndex}.webm`);

  const response = await fetch(
    `${MEDIA_SERVICE_URL}/media/chunk-upload?session_id=${sessionId}&sequence_index=${sequenceIndex}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Failed to upload audio chunk");
  }

  return response.json();
}

// Reasoning Service: Generate safe response
export async function generateResponse(
  sessionId: string,
  userInput: string,
  locale: string = "ta-IN"
): Promise<ReasoningResponse> {
  const response = await fetch(`${REASONING_SERVICE_URL}/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      user_input: userInput,
      locale,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Response generation failed" }));
    throw new Error(error.detail || "Failed to generate response");
  }

  return response.json();
}

// Speech Service: Text-to-Speech
export async function textToSpeech(
  text: string,
  locale: string = "ta-IN"
): Promise<TTSResponse> {
  const response = await fetch(`${SPEECH_SERVICE_URL}/tts/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      locale,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "TTS failed" }));
    throw new Error(error.detail || "Failed to generate speech");
  }

  const data = await response.json();
  
  // Construct full audio URL
  return {
    ...data,
    audioUrl: `${SPEECH_SERVICE_URL}${data.audioUrl}`,
  };
}

// Health checks
export async function checkAllServicesHealth(): Promise<{
  media: boolean;
  speech: boolean;
  reasoning: boolean;
  allHealthy: boolean;
}> {
  const results = await Promise.allSettled([
    fetch(`${MEDIA_SERVICE_URL}/health`).then(r => r.ok),
    fetch(`${SPEECH_SERVICE_URL}/health`).then(r => r.ok),
    fetch(`${REASONING_SERVICE_URL}/health`).then(r => r.ok),
  ]);

  const media = results[0].status === 'fulfilled' && results[0].value;
  const speech = results[1].status === 'fulfilled' && results[1].value;
  const reasoning = results[2].status === 'fulfilled' && results[2].value;

  return {
    media,
    speech,
    reasoning,
    allHealthy: media && speech && reasoning,
  };
}
