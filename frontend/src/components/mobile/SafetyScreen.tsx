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
  onTryGrounding: () => void;
  onReturn: () => void;
  serviceStatus: ServiceStatus;
  showReturnButton?: boolean;
}

export function SafetyScreen({
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
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Intro */}
        <p className="text-lg text-gray-800 leading-relaxed mb-6">
          {t("safety.intro")}
        </p>

        {/* 3-Step Safety Plan */}
        <div className="space-y-4 mb-8">
          {/* Step 1: Safe Person */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("safety.step1.title")}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {t("safety.step1.description")}
            </p>
          </div>

          {/* Step 2: NHS 111 */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("safety.step2.title")}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {t("safety.step2.description")}
            </p>
          </div>

          {/* Step 3: Emergency Services */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("safety.step3.title")}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {t("safety.step3.description")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
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
