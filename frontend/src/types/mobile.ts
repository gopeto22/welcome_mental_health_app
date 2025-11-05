/**
 * Mobile Frontend Types for Tamil Mind Mate
 * Based on MOBILE_FRONTEND_DEV_BRIEF.md specification
 */

export type Mode = "pre_session" | "chat" | "exercise" | "safety";
export type Substate = "idle" | "listening" | "thinking" | "speaking" | "show_transcript";
export type Locale = "en-GB" | "ta-IN";

export interface Message {
  role: "user" | "assistant";
  text: string;
  ts: number;
  isCrisis?: boolean;
  audioUrl?: string;
}

export interface ServiceStatus {
  speech: boolean;
  reasoning: boolean;
}

export interface AppState {
  mode: Mode;
  sub: Substate;
  locale: Locale;
  sessionId: string;
  sudsStart?: number;
  sudsEnd?: number;
  messages: Message[];
  serviceStatus: ServiceStatus;
  selectedExercise?: string;
  showTranscript: boolean;
  showExercises: boolean;
  showPostCheck: boolean;
}

// API Request/Response Types

export interface RespondRequest {
  session_id: string;
  locale: Locale;
  transcript_window: string[];
  mode?: "chat" | "exercise" | "safety";
}

export interface RiskFlags {
  has_self_harm?: boolean;
  has_medical_advice?: boolean;
  needs_escalation?: boolean;
}

export interface RespondResponse {
  reply_text: string;
  risk_flags?: RiskFlags;
  tts_text?: string;
  processing_time_ms?: number;
  meta?: any;
}

export interface STTRequest {
  audio: Blob;
  locale: Locale;
}

export interface STTResponse {
  text: string;
  confidence?: number;
}

export interface TTSRequest {
  text: string;
  locale: Locale;
  voice?: string;
}

export interface TTSResponse {
  url: string;
  duration_ms?: number;
}

// Exercise Types

export type ExerciseKey = "general" | "breathing" | "countdown";

export interface Exercise {
  key: ExerciseKey;
  titleKey: string;
  descKey: string;
  icon: string;
}

export const EXERCISES: Exercise[] = [
  {
    key: "general",
    titleKey: "exercises.general",
    descKey: "exercises.general_desc",
    icon: "🧘"
  },
  {
    key: "breathing",
    titleKey: "exercises.breathing",
    descKey: "exercises.breathing_desc",
    icon: "🫁"
  },
  {
    key: "countdown",
    titleKey: "exercises.countdown",
    descKey: "exercises.countdown_desc",
    icon: "🔢"
  }
];

// Analytics Events

export type AnalyticsEvent =
  | { event: "session_started"; suds_start: number }
  | { event: "exercise_started"; key: string }
  | { event: "exercise_completed"; key: string; duration_sec: number }
  | { event: "suds_check_post"; suds_end: number; delta: number }
  | { event: "entered_safety_mode"; trigger: "score_10" | "risk_flags" }
  | { event: "service_offline"; service: "speech" | "reasoning" }
  | { event: "stt_failed"; error: string }
  | { event: "tts_failed"; error: string };
