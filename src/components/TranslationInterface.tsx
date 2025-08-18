import { useState, useEffect } from "react";
import { Mic, MicOff, RotateCcw, Volume2, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const audioRecorderA = useAudioRecorder();
  const audioRecorderB = useAudioRecorder();

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

  const startListening = async (speaker: "A" | "B") => {
    try {
      // Stop other speaker if listening
      if (speaker === "A") {
        if (audioRecorderB.isRecording) {
          await audioRecorderB.stopRecording();
        }
        setIsListeningB(false);
        setIsListeningA(true);
        await audioRecorderA.startRecording();
      } else {
        if (audioRecorderA.isRecording) {
          await audioRecorderA.stopRecording();
        }
        setIsListeningA(false);
        setIsListeningB(true);
        await audioRecorderB.startRecording();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
      setIsListeningA(false);
      setIsListeningB(false);
    }
  };

  const stopListening = async (speaker: "A" | "B") => {
    try {
      let audioData: string | null = null;
      
      if (speaker === "A" && audioRecorderA.isRecording) {
        audioData = await audioRecorderA.stopRecording();
        setIsListeningA(false);
      } else if (speaker === "B" && audioRecorderB.isRecording) {
        audioData = await audioRecorderB.stopRecording();
        setIsListeningB(false);
      }

      if (audioData) {
        await processAudioData(audioData, speaker);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsListeningA(false);
      setIsListeningB(false);
    }
  };

  const processAudioData = async (audioData: string, speaker: "A" | "B") => {
    try {
      const isFromA = speaker === "A";
      const originalLang = isFromA ? speakerALanguage : speakerBLanguage;
      const targetLang = isFromA ? speakerBLanguage : speakerALanguage;

      // Step 1: Speech to text
      const { data: sttResponse, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: audioData,
          language: originalLang
        }
      });

      if (sttError || !sttResponse?.text) {
        throw new Error('Failed to transcribe audio');
      }

      const originalText = sttResponse.text;

      // Step 2: Translate text
      const { data: translateResponse, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: originalText,
          fromLanguage: originalLang,
          toLanguage: targetLang
        }
      });

      if (translateError || !translateResponse?.translatedText) {
        throw new Error('Failed to translate text');
      }

      const translatedText = translateResponse.translatedText;

      // Step 3: Add message to conversation
      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        originalText,
        translatedText,
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev.slice(0, 4)]);

      // Step 4: Text to speech for the translation
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          language: targetLang
        }
      });

      if (!ttsError && ttsResponse?.audioData) {
        playAudio(ttsResponse.audioData);
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Translation Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const playAudio = (audioBase64: string) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.volume = volume;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  };

  const repeatLastMessage = async () => {
    const lastMessage = messages[0];
    if (lastMessage) {
      try {
        const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: lastMessage.translatedText,
            language: lastMessage.speaker === "A" ? speakerBLanguage : speakerALanguage
          }
        });

        if (!ttsError && ttsResponse?.audioData) {
          playAudio(ttsResponse.audioData);
        }
      } catch (error) {
        console.error('Error repeating message:', error);
      }
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