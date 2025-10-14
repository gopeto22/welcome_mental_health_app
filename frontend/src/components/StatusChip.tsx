import { Mic, Activity, MessageSquare, Volume2 } from "lucide-react";

type Status = "idle" | "listening" | "transcribing" | "responding" | "speaking";

interface StatusChipProps {
  status: Status;
  timings?: {
    listening?: number;
    transcribing?: number;
    responding?: number;
    speaking?: number;
  };
}

export const StatusChip = ({ status, timings }: StatusChipProps) => {
  const statusConfig = {
    idle: {
      icon: Mic,
      label: "Ready",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      ariaLabel: "System ready",
    },
    listening: {
      icon: Mic,
      label: "Listening...",
      color: "bg-blue-100 text-blue-700 border-blue-300 animate-pulse",
      ariaLabel: "Recording audio",
    },
    transcribing: {
      icon: Activity,
      label: "Transcribing...",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      ariaLabel: "Converting speech to text",
    },
    responding: {
      icon: MessageSquare,
      label: "Thinking...",
      color: "bg-purple-100 text-purple-700 border-purple-300",
      ariaLabel: "Generating response",
    },
    speaking: {
      icon: Volume2,
      label: "Speaking...",
      color: "bg-green-100 text-green-700 border-green-300 animate-pulse",
      ariaLabel: "Playing audio response",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Format timing display
  const getTimingText = () => {
    if (!timings) return null;
    
    const parts: string[] = [];
    if (timings.listening) parts.push(`🎤 ${timings.listening}ms`);
    if (timings.transcribing) parts.push(`📝 ${timings.transcribing}ms`);
    if (timings.responding) parts.push(`💭 ${timings.responding}ms`);
    if (timings.speaking) parts.push(`🔊 ${timings.speaking}ms`);
    
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.color} transition-all duration-200`}
        role="status"
        aria-live="polite"
        aria-label={config.ariaLabel}
      >
        <Icon size={18} className="flex-shrink-0" />
        <span className="font-medium text-sm">{config.label}</span>
      </div>
      
      {getTimingText() && (
        <div className="text-xs text-gray-500 font-mono" aria-label="Processing timings">
          {getTimingText()}
        </div>
      )}
    </div>
  );
};
