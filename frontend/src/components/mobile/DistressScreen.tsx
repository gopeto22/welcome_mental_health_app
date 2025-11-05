/**
 * DistressScreen Component
 * Entry screen with SUDS slider (0-10), language toggle, and start button
 * Mobile-first design with large tap targets
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/types/mobile";

interface DistressScreenProps {
  onStart: (sudsLevel: number) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const BANNER_DISMISSED_KEY = "ai-therapy-assistant-banner-dismissed";

export function DistressScreen({ onStart, locale, onLocaleChange }: DistressScreenProps) {
  const { t } = useTranslation();
  const [sudsLevel, setSudsLevel] = useState<number>(5);
  const [hasMovedSlider, setHasMovedSlider] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
  });

  const handleSliderChange = (values: number[]) => {
    setSudsLevel(values[0]);
    setHasMovedSlider(true);
  };

  const handleStart = () => {
    if (hasMovedSlider) {
      onStart(sudsLevel);
    }
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  const toggleLocale = () => {
    const newLocale = locale === "en-GB" ? "ta-IN" : "en-GB";
    onLocaleChange(newLocale);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with Branding and Language Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-2xl">🧠</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {t("header.title")}
            </h1>
            <p className="text-xs text-gray-600 leading-tight">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
        
        {/* Language Toggle - Text Only */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLocale}
          className="tap-target text-xs font-medium border-2 bg-white px-4"
          aria-label={`Switch to ${locale === "en-GB" ? "Tamil" : "English"}`}
        >
          {locale === "en-GB" ? "Tamil" : "English"}
        </Button>
      </div>
      
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-12 text-gray-900">
          {t("suds.title")}
        </h2>

        {/* SUDS Slider */}
        <div className="w-full max-w-sm mb-4">
          <Slider
            value={[sudsLevel]}
            onValueChange={handleSliderChange}
            min={0}
            max={10}
            step={1}
            className="w-full"
            aria-label={t("suds.title")}
          />
          
          {/* Slider Labels */}
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>0 - {t("suds.notAtAll")}</span>
            <span className="font-semibold text-lg text-gray-900">{sudsLevel}</span>
            <span>10 - {t("suds.completely")}</span>
          </div>
        </div>

        {/* Start Button - NO MIC ICON */}
        <Button
          onClick={handleStart}
          disabled={!hasMovedSlider}
          className={`w-full max-w-sm h-14 text-lg font-medium mt-8 tap-target ${
            hasMovedSlider
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label={t("cta.start")}
        >
          {t("cta.start")}
        </Button>

        {/* Helper Text */}
        {!hasMovedSlider && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            {locale === "en-GB" ? "Move the slider to enable the start button" : "தொடங்கு பொத்தானை இயக்க ஸ்லைடரை நகர்த்தவும்"}
          </p>
        )}
      </div>

      {/* Safety Banner - Bottom */}
      <div className="p-4">
        {!bannerDismissed && (
          <Alert className="bg-amber-50 border-amber-200 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissBanner}
              className="absolute top-2 right-2 h-6 w-6"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-gray-700 pr-8">
              {t("banner.demo")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
