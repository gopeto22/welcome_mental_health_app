/**
 * MobileApp Component
 * Main orchestrator for mobile-first UI
 * Handles all screen transitions and state management
 */

import { useEffect, useRef } from "react";
import { useSession } from "@/hooks/useSession";
import { useTranslation } from "@/hooks/useTranslation";
import { DistressScreen } from "./DistressScreen";
import { ConversationScreen } from "./ConversationScreen";
import { SafetyScreen } from "./SafetyScreen";
import { TranscriptOverlay } from "./TranscriptOverlay";
import { ExercisesSheet } from "./ExercisesSheet";
import { PostExerciseCheck } from "./PostExerciseCheck";

export function MobileApp() {
  const { state, actions } = useSession();
  const { locale, setLocale } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check service health on mount and periodically
  useEffect(() => {
    actions.updateServiceStatus();
    const interval = setInterval(() => {
      actions.updateServiceStatus();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [actions]);

  // Sync locale between useSession and useTranslation
  useEffect(() => {
    actions.setLocale(locale);
  }, [locale, actions]);

  // Play exercise audio when exercise is selected
  useEffect(() => {
    if (state.mode === "exercise" && state.selectedExercise) {
      // Use locale-specific audio files: breathing_en.mp3 or breathing_ta.mp3
      const localeSuffix = locale === 'en-GB' ? 'en' : 'ta';
      const audioUrl = `/audio/exercises/${state.selectedExercise}_${localeSuffix}.mp3`;
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
          console.log("Exercise audio playing:", state.selectedExercise, "locale:", locale);
          actions.setSubstate("speaking");
        }).catch(err => {
          console.error("Failed to play exercise audio:", err);
        });

        audioRef.current.onended = () => {
          console.log("Exercise audio ended");
          actions.setSubstate("idle");
          // Show post-exercise check after 1 second
          setTimeout(() => {
            actions.setSubstate("idle");
          }, 1000);
        };
      }
    }
  }, [state.mode, state.selectedExercise, locale, actions]);

  // Render appropriate screen based on mode
  const renderMainScreen = () => {
    switch (state.mode) {
      case "pre_session":
        return (
          <DistressScreen
            onStart={actions.startSession}
            locale={locale}
            onLocaleChange={setLocale}
          />
        );

      case "safety":
        return (
          <SafetyScreen
            onTryGrounding={() => {
              actions.exitSafety();
              actions.toggleExercises();
            }}
            onReturn={actions.exitSafety}
            serviceStatus={state.serviceStatus}
            showReturnButton={state.messages.length > 0}
          />
        );

      case "chat":
      case "exercise":
      default:
        return (
          <ConversationScreen
            state={state}
            onToggleTranscript={actions.toggleTranscript}
            onToggleExercises={actions.toggleExercises}
            onSendMessage={actions.sendMessage}
            onSubstateChange={actions.setSubstate}
          />
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* Hidden audio element for exercise playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Main Screen */}
      {renderMainScreen()}

      {/* Transcript Overlay */}
      <TranscriptOverlay
        messages={state.messages}
        isOpen={state.showTranscript}
        onClose={actions.toggleTranscript}
      />

      {/* Exercises Sheet */}
      <ExercisesSheet
        isOpen={state.showExercises}
        onClose={actions.toggleExercises}
        onSelect={actions.selectExercise}
      />

      {/* Post-Exercise Check */}
            {state.showPostCheck && (
        <PostExerciseCheck
          onStop={(sudsEnd) => actions.completeExercise(sudsEnd, 'stop')}
          onRepeat={(sudsEnd) => {
            actions.completeExercise(sudsEnd, 'repeat');
            if (state.selectedExercise) {
              actions.selectExercise(state.selectedExercise);
            }
          }}
          onTryAnother={(sudsEnd) => {
            actions.completeExercise(sudsEnd, 'tryAnother');
            actions.setSubstate('idle');
          }}
        />
      )}
    </div>
  );
}
