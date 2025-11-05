import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SudsSlider } from "@/components/SudsSlider";
import { SessionSummary } from "@/components/SessionSummary";
import { generateResponse, textToSpeech, checkAllServicesHealth } from "@/api/client";
import { toast } from "sonner";
import { 
  Heart, 
  AlertCircle, 
  Send, 
  Volume2, 
  CheckCircle, 
  XCircle,
  Loader2,
  PlayCircle,
  StopCircle
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isCrisis?: boolean;
  audioUrl?: string;
}

const LiveDemo = () => {
  // Service health
  const [servicesHealth, setServicesHealth] = useState({
    media: false,
    speech: false,
    reasoning: false,
    allHealthy: false,
  });
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  // Session state
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Language selection (English default for clinician validation)
  const [locale, setLocale] = useState<"en-US" | "ta-IN">("en-US");

  // SUDS tracking
  const [sudsStart, setSudsStart] = useState<number | null>(null);
  const [sudsEnd, setSudsEnd] = useState<number | null>(null);
  const [showSudsStart, setShowSudsStart] = useState(true);
  const [showSudsEnd, setShowSudsEnd] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Check service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      setIsCheckingHealth(true);
      try {
        const health = await checkAllServicesHealth();
        setServicesHealth(health);
      } catch (error) {
        console.error("Health check failed:", error);
      } finally {
        setIsCheckingHealth(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = () => {
    if (sudsStart === null) {
      toast.error("Please rate your distress level first");
      return;
    }
    setShowSudsStart(false);
    setSessionStarted(true);
    setSessionStartTime(new Date());
    toast.success("Session started! You can now chat.");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Get AI response
      const transcriptWindow = [...messages, userMessage]
        .slice(-5) // Last 5 messages for context
        .map((m) => m.content);

      const response = await generateResponse(sessionId, transcriptWindow, locale);

      // Generate audio for response
      let audioUrl: string | undefined;
      try {
        // Select appropriate TTS voice based on locale
        const ttsVoice = locale === "ta-IN" ? "ta-IN-Standard-A" : "en-GB-Wavenet-C";
        const ttsResponse = await textToSpeech(response.response, ttsVoice);
        audioUrl = ttsResponse.audioUrl;
      } catch (error) {
        console.error("TTS failed:", error);
        toast.error("Audio generation failed, but response is ready");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        isCrisis: response.riskFlags.needsEscalation,
        audioUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show crisis alert if needed
      if (response.riskFlags.needsEscalation) {
        toast.error("Crisis detected - helpline information provided", {
          duration: 5000,
        });
      }

      // Auto-play audio if available
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch((err) => console.error("Audio playback error:", err));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to process message";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = () => {
    setShowSudsEnd(true);
    setSessionStarted(false);
  };

  const handleSudsEndComplete = async () => {
    if (sudsEnd === null || sudsStart === null) return;

    // Log session metrics
    try {
      const duration = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        : 0;

      const response = await fetch("http://localhost:8003/events/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          suds_start: sudsStart,
          suds_end: sudsEnd,
          message_count: messages.length,
          duration_seconds: duration,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Session metrics logged:", data);
        toast.success("Session data saved successfully");
      }
    } catch (error) {
      console.error("Failed to log session metrics:", error);
    }

    setShowSudsEnd(false);
    setShowSummary(true);
  };

  const handleNewSession = () => {
    setShowSummary(false);
    setSessionStarted(false);
    setShowSudsStart(true);
    setSudsStart(null);
    setSudsEnd(null);
    setMessages([]);
    setSessionStartTime(null);
    toast.success("Ready for new session");
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      toast.error("Failed to play audio");
    });
  };

  // Quick test scenarios based on current locale
  const testScenarios = locale === "ta-IN" ? [
    {
      label: "Crisis Test",
      text: "நான் தற்கொலை செய்து கொள்ள நினைக்கிறேன்",
      type: "crisis",
    },
    {
      label: "Abuse Disclosure",
      text: "என் தந்தை என்னை அடிக்கிறார்",
      type: "normal",
    },
    {
      label: "Anxiety",
      text: "எனக்கு மிகவும் பதட்டமாக உள்ளது",
      type: "normal",
    },
    {
      label: "Panic Attack",
      text: "எனக்கு மூச்சு விட முடியவில்லை",
      type: "normal",
    },
  ] : [
    {
      label: "Crisis Test",
      text: "I want to end it all",
      type: "crisis",
    },
    {
      label: "Abuse Disclosure",
      text: "My father beats me",
      type: "normal",
    },
    {
      label: "Anxiety",
      text: "I'm feeling very anxious right now",
      type: "normal",
    },
    {
      label: "Panic Attack",
      text: "I'm having a panic attack and can't breathe",
      type: "normal",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Tamil Mind Mate - Live Demo
                </h1>
                <p className="text-xs text-muted-foreground">
                  {locale === "en-US" 
                    ? "Voice-based mental health support (English)" 
                    : "Voice-based mental health support (தமிழ்)"}
                </p>
              </div>
            </div>

            {/* Language Toggle & Service Status */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={locale === "en-US" ? "default" : "ghost"}
                  onClick={() => setLocale("en-US")}
                  className="h-7 px-3 text-xs"
                >
                  🇬🇧 English
                </Button>
                <Button
                  size="sm"
                  variant={locale === "ta-IN" ? "default" : "ghost"}
                  onClick={() => setLocale("ta-IN")}
                  className="h-7 px-3 text-xs"
                >
                  தமிழ் Tamil
                </Button>
              </div>
              
              {/* Service Status */}
              {isCheckingHealth ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : servicesHealth.allHealthy ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">All Services Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Some Services Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed service status */}
          {!servicesHealth.allHealthy && !isCheckingHealth && (
            <div className="mt-3 flex gap-2 text-xs">
              <span className={servicesHealth.media ? "text-green-600" : "text-red-600"}>
                Media: {servicesHealth.media ? "✓" : "✗"}
              </span>
              <span className={servicesHealth.speech ? "text-green-600" : "text-red-600"}>
                Speech: {servicesHealth.speech ? "✓" : "✗"}
              </span>
              <span className={servicesHealth.reasoning ? "text-green-600" : "text-red-600"}>
                Reasoning: {servicesHealth.reasoning ? "✓" : "✗"}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left panel: Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Pre-session SUDS */}
            {showSudsStart && (
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  {locale === "en-US" 
                    ? "Distress Level" 
                    : "பதட்ட அளவீடு"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {locale === "en-US"
                    ? "Rate your current distress before starting"
                    : "தொடங்குவதற்கு முன் உங்கள் தற்போதைய மன உளைச்சலை மதிப்பிடுங்கள்"}
                </p>
                <SudsSlider
                  value={sudsStart ?? 5}
                  onChange={setSudsStart}
                  label={locale === "en-US" ? "Your current state" : "உங்கள் தற்போதைய நிலை"}
                  locale={locale}
                />
                <Button
                  onClick={handleStartSession}
                  className="w-full mt-4"
                  disabled={sudsStart === null || !servicesHealth.allHealthy}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {locale === "en-US" ? "Start Session" : "அமர்வை தொடங்கு"}
                </Button>
              </Card>
            )}

            {/* Post-session SUDS */}
            {showSudsEnd && (
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  {locale === "en-US" ? "Session Complete" : "அமர்வு நிறைவுற்றது"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {locale === "en-US" 
                    ? "How do you feel now?" 
                    : "இப்போது நீங்கள் எப்படி உணர்கிறீர்கள்?"}
                </p>
                <SudsSlider
                  value={sudsEnd ?? 5}
                  onChange={setSudsEnd}
                  label={locale === "en-US" ? "Your current state" : "உங்கள் தற்போதைய நிலை"}
                  locale={locale}
                />
                <Button
                  onClick={handleSudsEndComplete}
                  className="w-full mt-4"
                  disabled={sudsEnd === null}
                >
                  {locale === "en-US" ? "View Summary" : "சுருக்கத்தைக் காண்க"}
                </Button>
              </Card>
            )}

            {/* Session controls */}
            {sessionStarted && (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4 text-foreground">
                    {locale === "en-US" ? "Quick Tests" : "விரைவு சோதனைகள்"}
                  </h2>
                  <div className="space-y-2">
                    {testScenarios.map((scenario, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setInputText(scenario.text)}
                        variant={scenario.type === "crisis" ? "destructive" : "outline"}
                        className="w-full text-left justify-start text-xs"
                        size="sm"
                      >
                        {scenario.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4 text-foreground">
                    {locale === "en-US" ? "Session Info" : "அமர்வு தகவல்"}
                  </h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{locale === "en-US" ? "Messages" : "செய்திகள்"}: {messages.length}</p>
                    <p>{locale === "en-US" ? "SUDS Start" : "துவக்க SUDS"}: {sudsStart}</p>
                    <p>
                      {locale === "en-US" ? "Duration" : "கால அளவு"}:{" "}
                      {sessionStartTime
                        ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
                        : 0}
                      {locale === "en-US" ? "s" : " வி"}
                    </p>
                  </div>
                  <Button
                    onClick={handleEndSession}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    {locale === "en-US" ? "End Session" : "அமர்வை முடிக்கவும்"}
                  </Button>
                </Card>
              </>
            )}

            {/* Safety notice */}
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs text-foreground">
                {locale === "en-US"
                  ? "This is a demo tool, not a replacement for professional care. In emergency, call 044-46464646 (TN Mental Health Helpline)"
                  : "இது ஒரு முன்மாதிரி கருவி, தொழில்முறை பராமரிப்புக்கு மாற்றாக அல்ல. அவசரநிலையில், 044-46464646 (TN மனநல உதவி எண்) ஐ அழைக்கவும்"}
              </AlertDescription>
            </Alert>
          </div>

          {/* Right panel: Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-center">
                      {sessionStarted
                        ? (locale === "en-US" 
                            ? "Start chatting or use quick test buttons" 
                            : "அரட்டையைத் தொடங்கவும் அல்லது விரைவு சோதனை பொத்தான்களைப் பயன்படுத்தவும்")
                        : (locale === "en-US" 
                            ? "Complete SUDS rating to begin" 
                            : "தொடங்க SUDS மதிப்பீட்டை முடிக்கவும்")}
                    </p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : msg.isCrisis
                          ? "bg-red-500/10 border border-red-500/20 text-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        {msg.audioUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playAudio(msg.audioUrl!)}
                            className="h-6 px-2"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {msg.isCrisis && (
                        <div className="mt-2 pt-2 border-t border-red-500/20 text-xs text-red-600 dark:text-red-400">
                          ⚠️ Crisis detected - Helpline provided
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      sessionStarted
                        ? (locale === "en-US" 
                            ? "Type your message here..." 
                            : "உங்கள் செய்தியை இங்கே தட்டச்சு செய்யவும்...")
                        : (locale === "en-US"
                            ? "Complete SUDS rating first"
                            : "முதலில் SUDS மதிப்பீட்டை முடிக்கவும்")
                    }
                    disabled={!sessionStarted || isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!sessionStarted || isProcessing || !inputText.trim()}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Session Summary Modal */}
      <SessionSummary
        isOpen={showSummary}
        onClose={handleNewSession}
        sudsStart={sudsStart || 0}
        sudsEnd={sudsEnd || 0}
        messageCount={messages.length}
        locale={locale}
      />
    </div>
  );
};

export default LiveDemo;
