import { useEffect, useRef } from "react";
import { Volume2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  riskFlags?: {
    hasSelfHarm: boolean;
    hasMedicalAdvice: boolean;
    needsEscalation: boolean;
  };
}

interface TranscriptPaneProps {
  messages: Message[];
  onPlayAudio?: (audioUrl: string) => void;
}

export const TranscriptPane = ({ messages, onPlayAudio }: TranscriptPaneProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-full bg-card border-border shadow-soft">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-full p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Your conversation will appear here</p>
                <p className="text-xs mt-1">Press and hold the button to start speaking</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] space-y-2 ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-active text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Audio playback button for assistant messages */}
                      {message.role === "assistant" && message.audioUrl && (
                        <button
                          onClick={() => onPlayAudio?.(message.audioUrl!)}
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                          aria-label="Play audio response"
                        >
                          <Volume2 className="h-3 w-3 text-calm-primary" />
                        </button>
                      )}

                      {/* Risk flags */}
                      {message.riskFlags && Object.values(message.riskFlags).some(Boolean) && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Safety Alert
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
