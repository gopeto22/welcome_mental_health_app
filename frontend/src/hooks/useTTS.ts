/**
 * useTTS Hook (Text-to-Speech)
 * Handles audio playback of AI responses
 */

import { useState, useRef, useCallback } from "react";
import type { Locale } from "@/types/mobile";
import { postTTS, trackEvent } from "@/api/mobile";

interface UseTTSReturn {
  isPlaying: boolean;
  error: string | null;
  play: (text: string) => Promise<void>;
  stop: () => void;
}

export function useTTS(locale: Locale): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play text as speech
  const play = useCallback(async (text: string) => {
    try {
      setError(null);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Request TTS from service
      const response = await postTTS({
        text,
        locale,
      });

      // Create and play audio element
      const audio = new Audio(response.url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        const errorMsg = "Audio playback failed";
        setError(errorMsg);
        setIsPlaying(false);
        audioRef.current = null;
        trackEvent({
          event: "tts_failed",
          error: errorMsg,
          timestamp: Date.now(),
        });
      };

      await audio.play();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "TTS generation failed";
      setError(errorMsg);
      setIsPlaying(false);
      trackEvent({
        event: "tts_failed",
        error: errorMsg,
        timestamp: Date.now(),
      });
    }
  }, [locale]);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    error,
    play,
    stop,
  };
}
