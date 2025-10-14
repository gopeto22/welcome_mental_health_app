import { Phone, AlertCircle } from "lucide-react";

export const CrisisHelp = () => {
  return (
    <div
      className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6"
      role="alert"
      aria-live="polite"
      aria-label="Crisis support resources"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Emergency Support Available 24/7
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-red-700" />
              <a
                href="tel:044-46464646"
                className="text-red-800 font-mono hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                044-46464646
              </a>
              <span className="text-red-700">— SNEHA (India)</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-red-700" />
              <a
                href="tel:9152987821"
                className="text-red-800 font-mono hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                9152987821
              </a>
              <span className="text-red-700">— Vandrevala Foundation</span>
            </div>
          </div>
          <p className="text-xs text-red-700 mt-3">
            தமிழ்: நெருக்கடி நேரத்தில், மேலே உள்ள எண்களை அழைக்கவும்.
          </p>
        </div>
      </div>
    </div>
  );
};
