/**
 * SafetyScreen Component
 * Displayed when SUDS = 10 or crisis language detected
 * Warm, compassionate UI with emergency contact options
 */

import { Button } from "@/components/ui/button";
import { Phone, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { ServiceStatus } from "@/types/mobile";

interface SafetyScreenProps {
  onCallSupport: () => void;
  onTryGrounding: () => void;
  onReturn: () => void;
  serviceStatus: ServiceStatus;
  showReturnButton?: boolean;
}

export function SafetyScreen({
  onCallSupport,
  onTryGrounding,
  onReturn,
  serviceStatus,
  showReturnButton = false,
}: SafetyScreenProps) {
  const { t } = useTranslation();

  const allHealthy = serviceStatus.speech && serviceStatus.reasoning;
  const statusColor = allHealthy ? "bg-green-500" : "bg-red-500";

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-100 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <h1 className="text-lg font-semibold text-amber-900">
            {t("safety.title")}
          </h1>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${statusColor}`}
          title={allHealthy ? "Services online" : "Services offline"}
          aria-label={allHealthy ? "Services online" : "Services offline"}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Compassionate Copy */}
        <div className="space-y-4 mb-8">
          <p className="text-lg text-gray-800 leading-relaxed">
            {t("safety.intro")}
          </p>
          <p className="text-lg text-gray-800 leading-relaxed">
            {t("safety.step")}
          </p>
          <p className="text-lg text-gray-800 leading-relaxed">
            {t("safety.help")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Call Support Button */}
          <Button
            onClick={onCallSupport}
            className="w-full h-14 text-lg font-medium bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 tap-target"
            aria-label={t("safety.call")}
          >
            <Phone className="h-5 w-5" />
            {t("safety.call")}
          </Button>

          {/* Try Grounding Button */}
          <Button
            onClick={onTryGrounding}
            disabled={!allHealthy}
            className="w-full h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2 tap-target"
            aria-label={t("safety.grounding")}
          >
            <Heart className="h-5 w-5" />
            {t("safety.grounding")}
          </Button>

          {/* Return Button (optional) */}
          {showReturnButton && (
            <Button
              onClick={onReturn}
              variant="ghost"
              className="w-full h-14 text-lg font-medium text-gray-700 tap-target"
              aria-label={t("safety.return")}
            >
              {t("safety.return")}
            </Button>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-6 py-4 text-sm text-gray-600 text-center">
        You're not alone. Help is available.
      </div>
    </div>
  );
}
