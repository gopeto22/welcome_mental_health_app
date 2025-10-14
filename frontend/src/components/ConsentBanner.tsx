import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

export const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("mental-ai-consent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("mental-ai-consent", "true");
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t-2 border-blue-200 p-4 shadow-lg z-50"
      role="alertdialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        <div className="flex-1">
          <h3 id="consent-title" className="font-semibold text-gray-900 mb-2">
            🔒 Privacy Notice
          </h3>
          <p id="consent-description" className="text-sm text-gray-700 mb-3">
            <strong>Audio stays on your device.</strong> In Phase A, only text transcripts 
            may be sent to generate responses. In Phase B, all processing moves on-device. 
            No audio is stored or transmitted. Crisis keywords trigger local safety checks.
          </p>
          <p className="text-xs text-gray-600 mb-3">
            தமிழ்: உங்கள் ஆடியோ உங்கள் சாதனத்தில் தங்கும். உரையாடல் உரை மட்டுமே பதில்களை உருவாக்க அனுப்பப்படலாம்.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              I Understand
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 p-1"
          aria-label="Close consent banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
