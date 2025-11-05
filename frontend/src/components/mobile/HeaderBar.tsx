/**
 * HeaderBar Component
 * Top navigation with app title, transcript button, exercises button, and service status
 * Mobile-optimized with large tap targets
 */

import { Button } from "@/components/ui/button";
import { FileText, Dumbbell } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { ServiceStatus } from "@/types/mobile";

interface HeaderBarProps {
  onTranscriptClick: () => void;
  onExercisesClick: () => void;
  serviceStatus: ServiceStatus;
}

export function HeaderBar({ onTranscriptClick, onExercisesClick, serviceStatus }: HeaderBarProps) {
  const { t } = useTranslation();

  const allHealthy = serviceStatus.speech && serviceStatus.reasoning;
  const statusColor = allHealthy ? "bg-green-500" : serviceStatus.speech || serviceStatus.reasoning ? "bg-yellow-500" : "bg-red-500";

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      {/* App Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🧠</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            {t("header.title")}
          </span>
          <span className="text-xs text-gray-600 leading-tight">
            {t("header.subtitle")}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Transcript Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTranscriptClick}
          className="tap-target flex items-center gap-1"
          aria-label={t("header.transcript")}
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">{t("header.transcript")}</span>
        </Button>

        {/* Exercises Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExercisesClick}
          className="tap-target flex items-center gap-1"
          aria-label={t("header.exercises")}
        >
          <Dumbbell className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">{t("header.exercises")}</span>
        </Button>

        {/* Service Status Dot */}
        <div
          className={`w-3 h-3 rounded-full ${statusColor}`}
          title={allHealthy ? "All services online" : "Some services offline"}
          aria-label={allHealthy ? "All services online" : "Some services offline"}
        />
      </div>
    </header>
  );
}
