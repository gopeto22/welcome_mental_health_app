/**
 * ExercisesSheet Component
 * Bottom sheet with list of grounding exercises
 * Large tap targets for mobile
 */

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { EXERCISES } from "@/types/mobile";
import type { ExerciseKey } from "@/types/mobile";

interface ExercisesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (key: ExerciseKey) => void;
}

export function ExercisesSheet({ isOpen, onClose, onSelect }: ExercisesSheetProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("exercises.title")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="tap-target"
            aria-label={t("transcript.close")}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {EXERCISES.map((exercise) => (
            <button
              key={exercise.key}
              onClick={() => {
                onSelect(exercise.key);
                onClose();
              }}
              className="w-full p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors tap-target"
              aria-label={`Select ${t(exercise.titleKey)}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {exercise.icon}
                </span>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t(exercise.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {t(exercise.descKey)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(exercise.durationKey)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
