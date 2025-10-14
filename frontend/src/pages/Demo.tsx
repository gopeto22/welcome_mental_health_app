import { useState, useCallback, useEffect } from "react";
import { DevicePicker } from "@/components/DevicePicker";
import { VoiceButton } from "@/components/VoiceButton";
import { TranscriptPane, Message } from "@/components/TranscriptPane";
import { useRecorder } from "@/hooks/useRecorder";
import { useSessionStore } from "@/state/useSessionStore";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Demo = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { sessionId, initSession, incrementChunk, setRiskFlags } = useSessionStore();

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Handle audio chunk processing
  const handleChunkReady = useCallback(
    async (chunk: Blob, sequenceIndex: number) => {
      if (!sessionId) return;

      try {
        setIsProcessing(true);

        // 1. Upload chunk to media service
        await api.uploadChunk(sessionId, sequenceIndex, chunk);

        // 2. Get transcription
        const transcriptResponse = await api.transcribeChunk(sessionId, sequenceIndex);
        const userText = transcriptResponse.data.text;

        // Add user message to transcript
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: userText,
            timestamp: new Date(),
          },
        ]);

        // 3. Get AI response with safety checks
        const responseData = await api.getResponse(sessionId, [userText], "ta-IN");
        const { reply_text, risk_flags } = responseData.data;

        // Store risk flags
        if (risk_flags) {
          setRiskFlags(risk_flags);
          
          // Show alert if high risk
          if (risk_flags.needsEscalation) {
            toast.error("Crisis detected. Please seek immediate professional help.", {
              duration: 10000,
            });
          }
        }

        // 4. Generate TTS for response
        const ttsResponse = await api.generateTTS(reply_text, "ta-IN");
        const audioUrl = ttsResponse.data.file_url;

        // Add assistant message to transcript
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply_text,
            timestamp: new Date(),
            audioUrl,
            riskFlags: risk_flags,
          },
        ]);

        // Auto-play audio response
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch((err) => console.error("Audio playback error:", err));
        }

        incrementChunk();
      } catch (error: any) {
        console.error("Error processing chunk:", error);
        toast.error(error.response?.data?.detail || "Failed to process audio. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, incrementChunk, setRiskFlags]
  );

  const { isRecording, startRecording, stopRecording } = useRecorder({
    deviceId: selectedDeviceId,
    onChunkReady: handleChunkReady,
  });

  const handlePlayAudio = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      toast.error("Failed to play audio");
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-active flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Mental AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Tamil Voice Support</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left panel: Controls */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
              <h2 className="text-lg font-medium mb-4 text-foreground">Setup</h2>
              <DevicePicker
                selectedDeviceId={selectedDeviceId}
                onDeviceChange={setSelectedDeviceId}
              />
            </div>

            {/* Safety notice */}
            <Alert className="border-calm-warning/20 bg-calm-warning/5">
              <AlertCircle className="h-4 w-4 text-calm-warning" />
              <AlertDescription className="text-sm text-foreground">
                This is a support tool, not a replacement for professional mental health care. 
                In case of emergency, please contact local crisis services.
              </AlertDescription>
            </Alert>

            {/* Voice control */}
            <div className="bg-gradient-calm rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
              <VoiceButton
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                disabled={!selectedDeviceId || isProcessing}
              />
              
              {isProcessing && (
                <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                  Processing your message...
                </p>
              )}
            </div>
          </div>

          {/* Right panel: Transcript */}
          <div className="h-[calc(100vh-12rem)] lg:sticky lg:top-24">
            <TranscriptPane messages={messages} onPlayAudio={handlePlayAudio} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
