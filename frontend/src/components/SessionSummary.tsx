import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface SessionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  sudsStart: number;
  sudsEnd: number;
  messageCount: number;
  locale?: "en-US" | "ta-IN";
}

export const SessionSummary = ({
  isOpen,
  onClose,
  sudsStart,
  sudsEnd,
  messageCount,
  locale = "en-US",
}: SessionSummaryProps) => {
  const sudsDelta = sudsEnd - sudsStart;
  const improved = sudsDelta < 0;
  const worsened = sudsDelta > 0;
  const unchanged = sudsDelta === 0;

  const getTrendIcon = () => {
    if (improved) return <TrendingDown className="h-8 w-8 text-green-600" />;
    if (worsened) return <TrendingUp className="h-8 w-8 text-orange-600" />;
    return <Minus className="h-8 w-8 text-blue-600" />;
  };

  const getTrendMessage = () => {
    if (locale === "ta-IN") {
      if (improved) {
        return `பதட்டம் குறைந்தது: ${sudsStart} → ${sudsEnd} (${Math.abs(sudsDelta)} புள்ளிகள்)`;
      }
      if (worsened) {
        return `பதட்டம் அதிகரித்தது: ${sudsStart} → ${sudsEnd} (+${sudsDelta} புள்ளிகள்)`;
      }
      return `பதட்டம் மாறவில்லை: ${sudsStart}`;
    } else {
      if (improved) {
        return `Distress reduced: ${sudsStart} → ${sudsEnd} (${Math.abs(sudsDelta)} points)`;
      }
      if (worsened) {
        return `Distress increased: ${sudsStart} → ${sudsEnd} (+${sudsDelta} points)`;
      }
      return `Distress unchanged: ${sudsStart}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {locale === "en-US" ? "Session Complete" : "அமர்வு முடிவு"}
          </DialogTitle>
          <DialogDescription>
            {locale === "en-US" ? "Your session summary" : "உங்கள் அமர்வு சுருக்கம்"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* SUDS Change Visual */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{sudsStart}</div>
              <div className="text-xs text-muted-foreground">
                {locale === "en-US" ? "Start" : "தொடக்கம்"}
              </div>
            </div>

            {getTrendIcon()}

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{sudsEnd}</div>
              <div className="text-xs text-muted-foreground">
                {locale === "en-US" ? "End" : "முடிவு"}
              </div>
            </div>
          </div>

          {/* Trend Message */}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {getTrendMessage()}
            </p>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-card border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{messageCount}</div>
              <div className="text-xs text-muted-foreground">
                {locale === "en-US" ? "Messages" : "செய்திகள்"}
              </div>
            </div>
            <div className="p-3 bg-card border rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {improved ? "✓" : worsened ? "⚠" : "−"}
              </div>
              <div className="text-xs text-muted-foreground">
                {locale === "en-US" ? "Status" : "நிலை"}
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          {improved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                {locale === "en-US" 
                  ? "You made progress! 🌟" 
                  : "நீங்கள் முன்னேற்றம் கண்டீர்கள்! 🌟"}
              </p>
            </div>
          )}

          {worsened && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 text-center">
                {locale === "en-US"
                  ? "If struggling, please seek professional help"
                  : "கடினமாக இருந்தால், தொழில்முறை உதவியை நாடுங்கள்"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            {locale === "en-US" ? "Start New Session" : "புதிய அமர்வு தொடங்கு"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
