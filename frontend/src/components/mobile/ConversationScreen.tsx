/**
 * ConversationScreen Component
 * Main screen with HeaderBar, VoiceStage, and Composer
 * Manages chat interaction and overlays
 */

import { useEffect } from "react";
import { HeaderBar } from "./HeaderBar";
import { VoiceStage } from "./VoiceStage";
import { Composer } from "./Composer";
import { useSTT } from "@/hooks/useSTT";
import { useTTS } from "@/hooks/useTTS";
import type { AppState } from "@/types/mobile";

interface ConversationScreenProps {
  state: AppState;
  onToggleTranscript: () => void;
  onToggleExercises: () => void;
  onSendMessage: (text: string) => void;
  onSubstateChange: (sub: "idle" | "listening" | "thinking" | "speaking") => void;
}

export function ConversationScreen({
  state,
  onToggleTranscript,
  onToggleExercises,
  onSendMessage,
  onSubstateChange,
}: ConversationScreenProps) {
  const stt = useSTT(state.locale);
  const tts = useTTS(state.locale);

  // Handle TTS playback state
  useEffect(() => {
    if (tts.isPlaying) {
      onSubstateChange("speaking");
    } else if (state.sub === "speaking") {
      onSubstateChange("idle");
    }
  }, [tts.isPlaying, state.sub, onSubstateChange]);

  // Handle microphone recording
  const handleMicStart = async () => {
    onSubstateChange("listening");
    await stt.startListening();
  };

  const handleMicStop = async () => {
    const transcript = await stt.stopListening();
    onSubstateChange("idle");
    
    if (transcript.trim()) {
      onSendMessage(transcript);
    }
  };

  // Handle text input
  const handleSendText = (text: string) => {
    onSendMessage(text);
  };

  // Auto-play TTS for latest assistant message
  useEffect(() => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && !tts.isPlaying) {
      tts.play(lastMessage.text);
    }
  }, [state.messages]); // Intentionally not including tts in deps

  // Get latest assistant message for voice stage display
  const lastAssistantMessage = state.messages
    .filter(m => m.role === "assistant")
    .pop();

  const servicesOnline = state.serviceStatus.speech && state.serviceStatus.reasoning;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <HeaderBar
        onTranscriptClick={onToggleTranscript}
        onExercisesClick={onToggleExercises}
        serviceStatus={state.serviceStatus}
      />

      {/* Voice Stage */}
      <VoiceStage
        substate={state.sub}
        reassuranceText={lastAssistantMessage?.text}
      />

      {/* Composer */}
      <Composer
        onSend={handleSendText}
        onMicStart={handleMicStart}
        onMicStop={handleMicStop}
        isListening={stt.isListening}
        isDisabled={!servicesOnline}
      />
    </div>
  );
}
