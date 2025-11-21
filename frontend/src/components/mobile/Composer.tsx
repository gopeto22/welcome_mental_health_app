/**
 * Composer Component
 * Bottom bar with text input and microphone button
 * Supports typing and voice input with recording indicator
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ComposerProps {
  onSend: (text: string) => void;
  onMicStart: () => void;
  onMicStop: () => void;
  isListening: boolean;
  isDisabled: boolean;
}

export function Composer({ onSend, onMicStart, onMicStop, isListening, isDisabled }: ComposerProps) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  // Track recording time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isListening) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const handleSend = () => {
    if (inputText.trim() && !isDisabled) {
      onSend(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      onMicStop();
    } else {
      onMicStart();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {isListening ? (
        /* Listening Mode - Toggle to Stop */
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-gray-700 font-medium">
              {t("composer.listening")} {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            onClick={handleMicClick}
            className="tap-target bg-red-500 hover:bg-red-600 text-white h-12 px-6 rounded-full transition-all"
            aria-label="Stop listening"
          >
            <MicOff className="h-5 w-5 mr-2" />
            <span className="font-medium">Stop</span>
          </Button>
        </div>
      ) : (
        /* Text Input Mode with Start Button */
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isDisabled ? t("composer.offline") : t("composer.placeholder")}
            disabled={isDisabled || isListening}
            className="flex-1 h-12 text-base"
            aria-label={t("composer.placeholder")}
          />
          
          {inputText.trim() ? (
            <Button
              onClick={handleSend}
              disabled={isDisabled}
              className="tap-target bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-full"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleMicClick}
              disabled={isDisabled}
              className="tap-target bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-full transition-all"
              aria-label="Start listening"
            >
              <Mic className="h-5 w-5 mr-2" />
              <span className="font-medium">Start</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
