/**
 * TranscriptOverlay Component
 * Full-screen overlay showing conversation history
 * Scrollable message list with timestamps
 */

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Message } from "@/types/mobile";
import { formatDistanceToNow } from "date-fns";

interface TranscriptOverlayProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function TranscriptOverlay({ messages, isOpen, onClose }: TranscriptOverlayProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("transcript.title")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="tap-target"
          aria-label={t("transcript.close")}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-64px)]"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {/* Role Label */}
                <p className="text-xs font-medium mb-1 opacity-75">
                  {message.role === "user" ? t("transcript.user") : t("transcript.assistant")}
                </p>
                
                {/* Message Text */}
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
                
                {/* Timestamp */}
                <p className="text-xs mt-1 opacity-75">
                  {formatDistanceToNow(new Date(message.ts), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
