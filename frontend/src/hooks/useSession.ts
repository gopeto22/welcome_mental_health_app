/**
 * useSession Hook
 * Central state management for mobile frontend
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import type { AppState, Message, Mode, Substate, Locale, ServiceStatus } from "@/types/mobile";
import { postRespond, trackEvent, checkServiceHealth } from "@/api/mobile";

interface UseSessionReturn {
  state: AppState;
  actions: {
    startSession: (sudsStart: number) => void;
    sendMessage: (text: string) => Promise<void>;
    selectExercise: (key: string) => void;
    completeExercise: (sudsEnd: number, action: 'stop' | 'repeat' | 'tryAnother') => void;
    enterSafety: () => void;
    exitSafety: () => void;
    toggleTranscript: () => void;
    toggleExercises: () => void;
    setSubstate: (sub: Substate) => void;
    setLocale: (locale: Locale) => void;
    updateServiceStatus: () => Promise<void>;
  };
}

export function useSession(): UseSessionReturn {
  const [state, setState] = useState<AppState>({
    mode: "pre_session",
    sub: "idle",
    locale: "en-GB",
    sessionId: nanoid(),
    messages: [],
    serviceStatus: {
      speech: false,
      reasoning: false,
    },
    showTranscript: false,
    showExercises: false,
    showPostCheck: false,
  });

  // Use ref to always have latest state in async callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Start session with SUDS level
  const startSession = useCallback((sudsStart: number) => {
    const mode: Mode = sudsStart === 10 ? "safety" : "chat";
    
    setState(prev => ({
      ...prev,
      mode,
      sudsStart,
    }));

    trackEvent({
      event: "session_started",
      suds_start: sudsStart,
      timestamp: Date.now(),
    });
  }, []);

  // Enter safety mode
  const enterSafety = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: "safety",
    }));
  }, []);

  // Send user message and get AI response
  const sendMessage = useCallback(async (text: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      text,
      ts: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      sub: "thinking",
    }));

    try {
      // Get latest state from ref
      const currentState = stateRef.current;
      
      // Prepare transcript window (last 10 messages)
      const transcriptWindow = [...currentState.messages, userMessage]
        .slice(-10)
        .map(m => m.text);

      console.log("Sending to /respond:", {
        session_id: currentState.sessionId,
        locale: currentState.locale,
        transcript_window: transcriptWindow,
      });

      // Call reasoning service
      const response = await postRespond({
        session_id: currentState.sessionId,
        locale: currentState.locale,
        transcript_window: transcriptWindow,
        mode: currentState.mode === "safety" ? "safety" : currentState.mode === "exercise" ? "exercise" : "chat",
      });

      console.log("Got response:", response);

      // Check for crisis escalation
      if (response.risk_flags?.needs_escalation) {
        enterSafety();
        trackEvent({
          event: "entered_safety_mode",
          trigger: "risk_flags",
          timestamp: Date.now(),
        });
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        text: response.reply_text,
        ts: Date.now(),
        isCrisis: response.risk_flags?.needs_escalation,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        sub: "idle",
      }));
    } catch (error) {
      console.error("Send message error:", error);
      trackEvent({
        event: "send_message_failed",
        error: String(error),
        timestamp: Date.now(),
      });

      // Show error state but don't block UI
      setState(prev => ({
        ...prev,
        sub: "idle",
      }));
    }
  }, [enterSafety]);

  // Select exercise
  const selectExercise = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      mode: "exercise",
      selectedExercise: key,
      showExercises: false,
    }));

    trackEvent({
      event: "exercise_started",
      key,
      timestamp: Date.now(),
    });
  }, []);

  // Complete exercise with post-check
  const completeExercise = useCallback((sudsEnd: number, action: 'stop' | 'repeat' | 'tryAnother') => {
    setState(prev => {
      const delta = prev.sudsStart !== undefined ? prev.sudsStart - sudsEnd : 0;

      trackEvent({
        event: "suds_check_post",
        suds_end: sudsEnd,
        delta,
        action,
        timestamp: Date.now(),
      });

      if (action === 'repeat' && prev.selectedExercise) {
        setTimeout(() => selectExercise(prev.selectedExercise!), 100);
      }

      return {
        ...prev,
        sudsEnd,
        mode: action === 'tryAnother' ? "chat" : prev.mode,
        showPostCheck: false,
        showExercises: action === 'tryAnother',
      };
    });
  }, [selectExercise]);

  // Exit safety mode
  const exitSafety = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: "chat",
    }));
  }, []);

  // Toggle transcript overlay
  const toggleTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTranscript: !prev.showTranscript,
    }));
  }, []);

  // Toggle exercises sheet
  const toggleExercises = useCallback(() => {
    setState(prev => ({
      ...prev,
      showExercises: !prev.showExercises,
    }));
  }, []);

  // Set substate (for audio/UI states)
  const setSubstate = useCallback((sub: Substate) => {
    setState(prev => ({
      ...prev,
      sub,
    }));
  }, []);

  // Set locale
  const setLocale = useCallback((locale: Locale) => {
    setState(prev => ({
      ...prev,
      locale,
    }));
  }, []);

  // Update service status
  const updateServiceStatus = useCallback(async () => {
    const status = await checkServiceHealth();
    setState(prev => ({
      ...prev,
      serviceStatus: status,
    }));
  }, []);

  const actions = useMemo(() => ({
    startSession,
    sendMessage,
    selectExercise,
    completeExercise,
    enterSafety,
    exitSafety,
    toggleTranscript,
    toggleExercises,
    setSubstate,
    setLocale,
    updateServiceStatus,
  }), [startSession, sendMessage, selectExercise, completeExercise, enterSafety, exitSafety, toggleTranscript, toggleExercises, setSubstate, setLocale, updateServiceStatus]);

  return {
    state,
    actions,
  };
}
