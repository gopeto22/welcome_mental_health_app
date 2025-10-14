import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export const VoiceButton = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: VoiceButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setIsPressed(true);
    onStartRecording();
  };

  const handleRelease = () => {
    if (disabled) return;
    setIsPressed(false);
    onStopRecording();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        disabled={disabled}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        className={`
          relative h-32 w-32 rounded-full shadow-active transition-all duration-300
          ${isRecording 
            ? "bg-gradient-active scale-110 animate-pulse-soft" 
            : "bg-calm-primary hover:scale-105"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-calm-primary opacity-30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-calm-primary opacity-20 animate-ping" style={{ animationDelay: "0.3s" }} />
          </>
        )}
        
        {isRecording ? (
          <MicOff className="h-12 w-12 text-white relative z-10" />
        ) : (
          <Mic className="h-12 w-12 text-white relative z-10" />
        )}
      </Button>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? "Recording..." : "Press & Hold to Speak"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isRecording ? "Release to send" : "Speak in Tamil"}
        </p>
      </div>

      {/* Audio visualization bars */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-calm-primary rounded-full animate-wave"
              style={{
                height: "100%",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
