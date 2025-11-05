/**
 * VoiceStage Component
 * Central animated display for voice interaction states
 * Shows breathing bubble, thinking spinner, and reassurance text
 */

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Substate } from "@/types/mobile";

interface VoiceStageProps {
  substate: Substate;
  reassuranceText?: string;
}

export function VoiceStage({ substate, reassuranceText }: VoiceStageProps) {
  const { t } = useTranslation();

  // Determine display based on substate
  const renderContent = () => {
    switch (substate) {
      case "listening":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Listening Indicator */}
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-listening" />
              <div className="w-3 h-3 rounded-full bg-red-500 animate-listening" style={{ animationDelay: "0.2s" }} />
              <div className="w-3 h-3 rounded-full bg-red-500 animate-listening" style={{ animationDelay: "0.4s" }} />
            </div>
            <p className="text-lg text-gray-700 text-center">
              {t("voiceStage.listening")}
            </p>
          </div>
        );

      case "thinking":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Thinking Spinner */}
            <Loader2 className="h-12 w-12 text-blue-600 animate-pulse-thinking mb-4" />
            <p className="text-lg text-gray-700 text-center">
              {t("voiceStage.thinking")}
            </p>
          </div>
        );

      case "speaking":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Breathing Bubble */}
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 animate-breathe" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 opacity-60 animate-breathe" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 opacity-40 animate-breathe" style={{ animationDelay: "1s" }} />
            </div>
            <p className="text-lg text-gray-700 text-center px-4">
              {reassuranceText || t("voiceStage.speaking")}
            </p>
          </div>
        );

      case "idle":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Calm Background */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6 flex items-center justify-center">
              <span className="text-4xl">💙</span>
            </div>
            <p className="text-lg text-gray-700 text-center px-4">
              {reassuranceText || t("voiceStage.idle")}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      {renderContent()}
    </div>
  );
}
