import { useState, useEffect } from "react";
import { Mic, MicOff, RotateCcw, Volume2, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  speaker: "A" | "B";
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

interface TranslationInterfaceProps {
  speakerALanguage: string;
  speakerBLanguage: string;
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
}

export const TranslationInterface = ({
  speakerALanguage,
  speakerBLanguage,
  onOpenSettings,
  onOpenAdminSettings
}: TranslationInterfaceProps) => {
  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Language code to name mapping
  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: "English",
      hu: "Hungarian",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean"
    };
    return languages[code] || code.toUpperCase();
  };

  // Language code to flag mapping  
  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      en: "🇺🇸",
      hu: "🇭🇺", 
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      it: "🇮🇹",
      pt: "🇵🇹",
      zh: "🇨🇳",
      ja: "🇯🇵",
      ko: "🇰🇷"
    };
    return flags[code] || "🌐";
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startListening = (speaker: "A" | "B") => {
    // Stop other speaker if listening
    if (speaker === "A") {
      setIsListeningB(false);
      setIsListeningA(true);
    } else {
      setIsListeningA(false);
      setIsListeningB(true);
    }

    // Simulate speech recognition and translation
    setTimeout(() => {
      const isFromA = speaker === "A";
      const originalLang = isFromA ? speakerALanguage : speakerBLanguage;
      const targetLang = isFromA ? speakerBLanguage : speakerALanguage;
      
      const sampleTexts = {
        en: ["Hello, how are you?", "Nice to meet you", "Thank you very much"],
        hu: ["Szia, hogy vagy?", "Örülök, hogy megismerlek", "Nagyon köszönöm"]
      };
      
      const texts = sampleTexts[originalLang as keyof typeof sampleTexts] || ["Sample text"];
      const originalText = texts[Math.floor(Math.random() * texts.length)];
      
      const translatedText = originalLang === "en" && targetLang === "hu" 
        ? "Szia, hogy vagy?" 
        : "Hello, how are you?";

      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        originalText,
        translatedText,
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev.slice(0, 4)]);
      
      if (speaker === "A") {
        setIsListeningA(false);
      } else {
        setIsListeningB(false);
      }
    }, 2000);
  };

  const stopListening = (speaker: "A" | "B") => {
    if (speaker === "A") {
      setIsListeningA(false);
    } else {
      setIsListeningB(false);
    }
  };

  const repeatLastMessage = () => {
    const lastMessage = messages[0];
    if (lastMessage) {
      // Simulate TTS for the last message
      console.log(`Playing: ${lastMessage.originalText} -> ${lastMessage.translatedText}`);
    }
  };

  const getRecentMessages = (speaker: "A" | "B") => {
    return messages
      .filter(msg => msg.speaker === speaker)
      .slice(0, 3);
  };

  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      {/* Split Screen Layout */}
      <div className="h-full flex flex-col">
        {/* Top Panel - Speaker B (Hungarian - Rotated 180°) */}
        <div className="flex-1 bg-accent/5 border-b-2 border-accent relative">
          <div className="h-full w-full transform rotate-180">
            <div className="h-full flex flex-col p-4">
              {/* Speaker B Language Header (rotated view) */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">{getLanguageFlag(speakerBLanguage)}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {getLanguageName(speakerBLanguage)}
                </span>
              </div>

              {/* Speaker B Messages (rotated view) */}
              <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
                {getRecentMessages("B").map((message) => (
                  <Card key={message.id} className="p-3 bg-accent/10 border-accent/20">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {message.originalText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {message.translatedText}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Speaker B Microphone Button (rotated view) */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant={isListeningB ? "default" : "outline"}
                  className={cn(
                    "h-16 w-16 rounded-full transition-all duration-300",
                    isListeningB && "bg-accent shadow-glow scale-110"
                  )}
                  onMouseDown={() => startListening("B")}
                  onMouseUp={() => stopListening("B")}
                  onTouchStart={() => startListening("B")}
                  onTouchEnd={() => stopListening("B")}
                >
                  {isListeningB ? (
                    <MicOff className="h-6 w-6 text-accent-foreground" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - Speaker A (English - Normal orientation) */}
        <div className="flex-1 bg-primary/5 relative">
          <div className="h-full flex flex-col p-4">
            {/* Speaker A Language Header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">{getLanguageFlag(speakerALanguage)}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {getLanguageName(speakerALanguage)}
              </span>
            </div>

            {/* Speaker A Messages */}
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
              {getRecentMessages("A").map((message) => (
                <Card key={message.id} className="p-3 bg-primary/10 border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {message.originalText}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {message.translatedText}
                  </p>
                </Card>
              ))}
            </div>

            {/* Speaker A Microphone Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isListeningA ? "default" : "outline"}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300",
                  isListeningA && "bg-primary shadow-glow scale-110"
                )}
                onMouseDown={() => startListening("A")}
                onMouseUp={() => stopListening("A")}
                onTouchStart={() => startListening("A")}
                onTouchEnd={() => stopListening("A")}
              >
                {isListeningA ? (
                  <MicOff className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Language Indicators */}
      <div className="fixed top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/50 shadow-lg">
          <span className="text-xs font-medium text-muted-foreground">
            {getLanguageFlag(speakerBLanguage)} {speakerBLanguage.toUpperCase()}
          </span>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/50 shadow-lg">
          <span className="text-xs font-medium text-muted-foreground">
            {getLanguageFlag(speakerALanguage)} {speakerALanguage.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Volume Control - Large and prominent on right edge */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
        <Volume2 className="h-5 w-5 text-muted-foreground" />
        <div className="h-32 flex items-center">
          <Slider
            value={[Math.round(volume * 100)]}
            onValueChange={(value) => setVolume(value[0] / 100)}
            max={100}
            step={1}
            orientation="vertical"
            className="h-28"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{Math.round(volume * 100)}%</span>
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-4 right-4 z-20 flex flex-col gap-2">
        {/* Connection Status */}
        <div className="bg-card/80 backdrop-blur-sm rounded-full p-2 border border-border/50 shadow-lg">
          <ConnectionIcon className={cn("h-4 w-4", isOnline ? "text-success" : "text-destructive")} />
        </div>
        
        {/* Combined Settings/Admin Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent/80"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Repeat Button - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={repeatLastMessage}
          disabled={messages.length === 0}
          className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent/80 disabled:opacity-50"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};