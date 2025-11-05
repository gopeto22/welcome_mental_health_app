/**
 * useSTT Hook (Speech-to-Text)
 * Handles microphone recording and transcription
 */

import { useState, useRef, useCallback } from "react";
import type { Locale } from "@/types/mobile";
import { postSTT, trackEvent } from "@/api/mobile";

interface UseSTTReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<string>;
}

export function useSTT(locale: Locale): UseSTTReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Start recording
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript("");
      audioChunksRef.current = [];

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Microphone access denied";
      setError(errorMsg);
      trackEvent({
        event: "stt_failed",
        error: errorMsg,
        timestamp: Date.now(),
      });
    }
  }, []);

  // Stop recording and transcribe
  const stopListening = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve("");
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          setIsListening(false);

          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType 
          });

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach(track => track.stop());

          // Send to STT service
          const result = await postSTT({
            audio: audioBlob,
            locale,
          });

          setTranscript(result.text);
          resolve(result.text);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Transcription failed";
          setError(errorMsg);
          trackEvent({
            event: "stt_failed",
            error: errorMsg,
            timestamp: Date.now(),
          });
          resolve("");
        } finally {
          // Cleanup
          mediaRecorderRef.current = null;
          audioChunksRef.current = [];
        }
      };

      mediaRecorder.stop();
    });
  }, [locale]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
