import { useState, useCallback, useEffect } from "react";
import { DevicePicker } from "@/components/DevicePicker";
import { VoiceButton } from "@/components/VoiceButton";
import { TranscriptPane, Message } from "@/components/TranscriptPane";
import { SudsSlider } from "@/components/SudsSlider";
import { SessionSummary } from "@/components/SessionSummary";
import { useRecorder } from "@/hooks/useRecorder";
import { useSessionStore } from "@/state/useSessionStore";
import { uploadAudioChunk, generateResponse, textToSpeech } from "@/api/client";
import { toast } from "sonner";
import { Heart, AlertCircle, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Demo = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // SUDS tracking
  const [sudsStart, setSudsStart] = useState<number | null>(null);
  const [sudsEnd, setSudsEnd] = useState<number | null>(null);
  const [showSudsStart, setShowSudsStart] = useState(true);
  const [showSudsEnd, setShowSudsEnd] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const { sessionId, initSession, incrementChunk, setRiskFlags } = useSessionStore();

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Add demo conversation examples on mount
  useEffect(() => {
    setMessages([
      {
        role: "user",
        content: "எனக்கு மிகவும் பதட்டமாக உள்ளது",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        role: "assistant",
        content: "உங்கள் பதட்டம் புரிந்து கொள்கிறேன். என்ன நடக்கிறது என்று சொல்ல முடியுமா?",
        timestamp: new Date(Date.now() - 118000),
      },
      {
        role: "user",
        content: "என் மனதை அமைதிப்படுத்த உதவ முடியுமா",
        timestamp: new Date(Date.now() - 60000),
      },
      {
        role: "assistant",
        content: "நிச்சயமாக உதவுகிறேன். முதலில் ஆழமாக மூச்சு விடுங்கள். நான் உங்களுடன் இருக்கிறேன்.",
        timestamp: new Date(Date.now() - 58000),
      },
    ]);
  }, []);

  const handleStartSession = () => {
    if (sudsStart === null) {
      toast.error("Please rate your distress level first");
      return;
    }
    setShowSudsStart(false);
    setSessionStarted(true);
  };

  const handleEndSession = () => {
    setShowSudsEnd(true);
  };

  const handleSudsEndComplete = async () => {
    if (sudsEnd !== null && sudsStart !== null) {
      // Log session metrics to backend
      try {
        const response = await fetch("http://localhost:8003/events/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            suds_start: sudsStart,
            suds_end: sudsEnd,
            message_count: messages.length,
            duration_seconds: Math.floor((Date.now() - (messages[0]?.timestamp?.getTime() || Date.now())) / 1000),
            timestamp: new Date().toISOString(),
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Session metrics logged:", data);
        }
      } catch (error) {
        console.error("Failed to log session metrics:", error);
        // Don't block UI on logging failure
      }
      
      setShowSudsEnd(false);
      setShowSummary(true);
    }
  };

  const handleNewSession = () => {
    setShowSummary(false);
    setSessionStarted(false);
    setShowSudsStart(true);
    setSudsStart(null);
    setSudsEnd(null);
    setMessages([]);
    initSession();
  };

  // Handle audio chunk processing
  const handleChunkReady = useCallback(
    async (chunk: Blob, sequenceIndex: number) => {
      if (!sessionId) return;

      try {
        setIsProcessing(true);

        // 1. Upload chunk and get transcription in one call
        const transcriptResponse = await uploadAudioChunk(sessionId, sequenceIndex, chunk);
        const userText = transcriptResponse.transcript;

        // Add user message to transcript
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: userText,
            timestamp: new Date(),
          },
        ]);

        // 2. Get AI response with safety checks
        const responseData = await generateResponse(sessionId, [userText], "ta-IN");
        const { response: reply_text, riskFlags } = responseData;

        // Store risk flags
        if (riskFlags) {
          setRiskFlags({
            hasSelfHarm: riskFlags.hasSelfHarm,
            hasMedicalAdvice: riskFlags.hasMedicalAdvice,
            needsEscalation: riskFlags.needsEscalation,
          });
          
          // Show alert if high risk
          if (riskFlags.needsEscalation) {
            toast.error("Crisis detected. Please seek immediate professional help.", {
              duration: 10000,
            });
          }
        }

        // 3. Generate TTS for response
        const ttsResponse = await textToSpeech(reply_text, "ta-IN");
        const audioUrl = ttsResponse.audioUrl;

        // Add assistant message to transcript
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply_text,
            timestamp: new Date(),
            audioUrl,
            riskFlags,
          },
        ]);

        // Auto-play audio response
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch((err) => console.error("Audio playback error:", err));
        }

        incrementChunk();
      } catch (error) {
        console.error("Error processing chunk:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process audio. Please try again.";
        toast.error(errorMessage);
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
            {/* Pre-session SUDS */}
            {showSudsStart && (
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  பதட்ட அளவீடு (Distress Level)
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  தொடங்குவதற்கு முன், உங்கள் தற்போதைய பதட்ட நிலையை மதிப்பிடுங்கள்<br />
                  <span className="text-xs">Rate your current distress before starting</span>
                </p>
                <SudsSlider
                  value={sudsStart ?? 5}
                  onChange={setSudsStart}
                  label="உங்கள் தற்போதைய நிலை (Your current state)"
                />
                <Button
                  onClick={handleStartSession}
                  className="w-full mt-4"
                  disabled={sudsStart === null}
                >
                  <Play className="h-4 w-4 mr-2" />
                  அமர்வை தொடங்கு (Start Session)
                </Button>
              </Card>
            )}

            {/* Session controls (only show after SUDS start) */}
            {sessionStarted && (
              <>
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
                  
                  {messages.length > 0 && (
                    <Button
                      onClick={handleEndSession}
                      variant="outline"
                      className="mt-4"
                    >
                      அமர்வை முடிக்க (End Session)
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Post-session SUDS */}
            {showSudsEnd && (
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  இறுதி மதிப்பீடு (Final Assessment)
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  இப்போது உங்கள் பதட்ட நிலையை மதிப்பிடுங்கள்<br />
                  <span className="text-xs">Rate your distress level now</span>
                </p>
                <SudsSlider
                  value={sudsEnd ?? 5}
                  onChange={setSudsEnd}
                  label="உங்கள் தற்போதைய நிலை (Your current state)"
                />
                <Button
                  onClick={handleSudsEndComplete}
                  className="w-full mt-4"
                  disabled={sudsEnd === null}
                >
                  சுருக்கத்தைக் காட்டு (Show Summary)
                </Button>
              </Card>
            )}
          </div>

          {/* Right panel: Transcript */}
          <div className="h-[calc(100vh-12rem)] lg:sticky lg:top-24">
            <TranscriptPane messages={messages} onPlayAudio={handlePlayAudio} />
          </div>
        </div>
      </main>

      {/* Session Summary Modal */}
      <SessionSummary
        isOpen={showSummary}
        onClose={handleNewSession}
        sudsStart={sudsStart ?? 0}
        sudsEnd={sudsEnd ?? 0}
        messageCount={messages.length}
      />
    </div>
  );
};

export default Demo;
