/**
 * PostExerciseCheck Component
 * Shows after exercise completion
 * Mini SUDS check with 3 action buttons
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "@/hooks/useTranslation";

interface PostExerciseCheckProps {
  onStop: (sudsEnd: number) => void;
  onRepeat: (sudsEnd: number) => void;
  onTryAnother: (sudsEnd: number) => void;
}

export function PostExerciseCheck({ onStop, onRepeat, onTryAnother }: PostExerciseCheckProps) {
  const { t } = useTranslation();
  const [sudsEnd, setSudsEnd] = useState<number>(5);

  const handleSliderChange = (values: number[]) => {
    setSudsEnd(values[0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      {/* Content - Centered */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-8 text-gray-900">
          {t("postExercise.title")}
        </h2>

        {/* Mini SUDS Slider */}
        <div className="mb-8">
          <Slider
            value={[sudsEnd]}
            onValueChange={handleSliderChange}
            min={0}
            max={10}
            step={1}
            className="w-full"
            aria-label={t("postExercise.title")}
          />
          
          {/* Slider Labels */}
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>0 - {t("suds.label_0")}</span>
            <span className="font-semibold text-lg text-gray-900">{sudsEnd}</span>
            <span>10 - {t("suds.label_10")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Stop Button (Green) */}
          <Button
            onClick={() => onStop(sudsEnd)}
            className="w-full h-14 text-lg font-medium bg-green-600 hover:bg-green-700 text-white tap-target"
            aria-label={t("postExercise.stop")}
          >
            {t("postExercise.stop")}
          </Button>

          {/* Repeat Button (Blue) */}
          <Button
            onClick={() => onRepeat(sudsEnd)}
            className="w-full h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white tap-target"
            aria-label={t("postExercise.repeat")}
          >
            {t("postExercise.repeat")}
          </Button>

          {/* Try Another Button (Gray) */}
          <Button
            onClick={() => onTryAnother(sudsEnd)}
            variant="outline"
            className="w-full h-14 text-lg font-medium border-gray-300 text-gray-700 hover:bg-gray-50 tap-target"
            aria-label={t("postExercise.tryAnother")}
          >
            {t("postExercise.tryAnother")}
          </Button>
        </div>
      </div>
    </div>
  );
}
