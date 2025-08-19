import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWA } from "@/hooks/usePWA";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useManagedMode } from "@/hooks/useManagedMode";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Settings, Volume2, VolumeX, Repeat, Languages } from "lucide-react";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { WakeLockIndicator } from "./WakeLockIndicator";
import { ConnectionStatus } from "./ConnectionStatus";

interface Message {
  id: string;
  speaker: "A" | "B";
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

interface UnifiedTranslationInterfaceProps {
  speakerALanguage: string;
  speakerBLanguage: string;
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
  onSignOut?: () => void;
  onLanguageChange?: (speakerA: string, speakerB: string) => void;
}

export const UnifiedTranslationInterface = ({ 
  speakerALanguage, 
  speakerBLanguage, 
  onOpenSettings, 
  onOpenAdminSettings, 
  onSignOut,
  onLanguageChange
}: UnifiedTranslationInterfaceProps) => {
  const [currentSpeaker, setCurrentSpeaker] = useState<"A" | "B">("A");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  
  // Individual settings for each speaker
  const [speakerAVoice, setSpeakerAVoice] = useState("alloy");
  const [speakerBVoice, setSpeakerBVoice] = useState("nova");
  
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const microphoneRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const audioRecorder = useAudioRecorder();
  const isMobile = useIsMobile();
  const { isStandalone } = usePWA();
  const wakeLock = useWakeLock();
  const managedMode = useManagedMode();
  
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

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleStartRecording = async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    if (managedMode.isEnabled && !managedMode.canSpeak(currentSpeaker)) {
      toast({
        title: "Not Your Turn",
        description: `Wait for Speaker ${currentSpeaker === "A" ? "B" : "A"} to finish speaking.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      
      // Clear any existing processing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorder.isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      // Set processing timeout
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "Processing Timeout",
          description: "Translation took too long. Please try again.",
          variant: "destructive",
        });
      }, 30000);

      const audioData = await audioRecorder.stopRecording();
      
      if (!audioData) {
        throw new Error("No audio recorded");
      }

      // Convert to blob if it's a string (base64)
      const audioBlob = typeof audioData === 'string' 
        ? new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/mp3' })
        : audioData;

      await processTranslation(audioBlob, currentSpeaker);
      
      // Switch speaker turn
      setCurrentSpeaker(prev => prev === "A" ? "B" : "A");
      
      if (managedMode.isEnabled) {
        managedMode.switchTurn();
      }

    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast({
        title: "Recording Failed",
        description: "Failed to process recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    }
  };

  const processTranslation = async (audioBlob: Blob, speaker: "A" | "B") => {
    const sourceLang = speaker === "A" ? speakerALanguage : speakerBLanguage;
    const targetLang = speaker === "A" ? speakerBLanguage : speakerALanguage;

    // Step 1: Convert audio to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    // Step 2: Speech to text
    const { data: sttResponse, error: sttError } = await supabase.functions.invoke('speech-to-text', {
      body: {
        audio: base64Audio,
        language: sourceLang
      }
    });

    if (sttError || !sttResponse?.text) {
      throw new Error(sttError?.message || "Speech recognition failed");
    }

    const originalText = sttResponse.text;

    // Step 3: Translate text
    const { data: translateResponse, error: translateError } = await supabase.functions.invoke('translate-text', {
      body: {
        text: originalText,
        sourceLang,
        targetLang
      }
    });

    if (translateError || !translateResponse?.translatedText) {
      throw new Error(translateError?.message || "Translation failed");
    }

    const translatedText = translateResponse.translatedText;

    // Step 4: Create message
    const newMessage: Message = {
      id: `${Date.now()}-${speaker}`,
      speaker,
      originalText,
      translatedText,
      timestamp: new Date()
    };

    setMessages(prev => [newMessage, ...prev]);
    setLastMessage(newMessage);

    // Step 5: Text to speech for the translation
    if (!isMuted) {
      const voiceToUse = speaker === "A" ? speakerAVoice : speakerBVoice;
      
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          language: targetLang,
          voice: voiceToUse
        }
      });

      if (ttsResponse?.audio && !ttsError) {
        const audio = new Audio(`data:audio/mp3;base64,${ttsResponse.audio}`);
        audio.volume = volume;
        await audio.play();
      }
    }
  };

  const handleRepeatLastMessage = async () => {
    if (!lastMessage || isMuted) return;

    try {
      const targetLang = currentSpeaker === "A" ? speakerALanguage : speakerBLanguage;
      const voiceToUse = lastMessage.speaker === "A" ? speakerAVoice : speakerBVoice;
      
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: lastMessage.translatedText,
          language: targetLang,
          voice: voiceToUse
        }
      });

      if (ttsResponse?.audio && !ttsError) {
        const audio = new Audio(`data:audio/mp3;base64,${ttsResponse.audio}`);
        audio.volume = volume;
        await audio.play();
      }
    } catch (error) {
      console.error("Failed to repeat message:", error);
      toast({
        title: "Playback Failed",
        description: "Could not repeat the message.",
        variant: "destructive",
      });
    }
  };

  const WaveVisualization = () => (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full transition-all duration-200",
            isRecording ? "wave-bar h-8" : "h-2"
          )}
        />
      ))}
    </div>
  );

  const MicrophoneButton = () => (
    <div className="relative">
      {/* Ripple effect when recording */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full bg-primary/20 microphone-ripple" />
      )}
      
      <Button
        ref={microphoneRef}
        size="lg"
        variant={isRecording ? "default" : "outline"}
        className={cn(
          "w-40 h-40 rounded-full shadow-strong transition-all duration-300",
          "hover:shadow-glow hover:scale-105",
          isRecording && "bg-primary text-primary-foreground shadow-glow scale-105",
          !isRecording && "bg-card hover:bg-accent"
        )}
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
        disabled={isProcessing || !isOnline}
      >
        <div className="flex flex-col items-center gap-2">
          {isRecording ? (
            <MicOff className="w-12 h-12" />
          ) : (
            <Mic className="w-12 h-12" />
          )}
          <span className="text-sm font-medium">
            {isRecording ? "Release" : "Hold to Speak"}
          </span>
        </div>
      </Button>
    </div>
  );

  return (
    <div className="h-screen w-full bg-gradient-surface flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ConnectionStatus isOnline={isOnline} />
            <WakeLockIndicator 
              isActive={wakeLock.isActive}
              isSupported={wakeLock.isSupported}
              onToggle={() => wakeLock.isActive ? wakeLock.release() : wakeLock.request()}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
        {/* Current Speaker Indicator */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Speaker {currentSpeaker}
          </h1>
          <p className="text-muted-foreground">
            Speaking {getLanguageName(currentSpeaker === "A" ? speakerALanguage : speakerBLanguage)}
          </p>
          <p className="text-sm text-muted-foreground">
            → Translating to {getLanguageName(currentSpeaker === "A" ? speakerBLanguage : speakerALanguage)}
          </p>
        </div>

        {/* Audio Visualization */}
        <div className="h-12 flex items-center">
          {isRecording && <WaveVisualization />}
          {isProcessing && <ProcessingIndicator isProcessing={isProcessing} speaker={currentSpeaker} />}
        </div>

        {/* Large Microphone Button */}
        <MicrophoneButton />

        {/* Last Message Display */}
        {lastMessage && (
          <div className="max-w-md text-center space-y-3 bg-card/50 backdrop-blur-sm rounded-xl p-6 shadow-soft">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Speaker {lastMessage.speaker} said:
              </p>
              <p className="font-medium text-foreground">
                {lastMessage.originalText}
              </p>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm text-muted-foreground">Translation:</p>
              <p className="font-medium text-primary">
                {lastMessage.translatedText}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepeatLastMessage}
              className="mt-2"
              disabled={isMuted}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Repeat
            </Button>
          </div>
        )}

        {/* Language Switch Indicator */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              currentSpeaker === "A" ? "bg-speaker-a" : "bg-muted"
            )} />
            <span>{getLanguageName(speakerALanguage)}</span>
          </div>
          
          <Languages className="w-4 h-4" />
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              currentSpeaker === "B" ? "bg-speaker-b" : "bg-muted"
            )} />
            <span>{getLanguageName(speakerBLanguage)}</span>
          </div>
        </div>
      </main>

      {/* Footer with Quick Actions */}
      <footer className="flex-shrink-0 px-6 py-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSpeaker(prev => prev === "A" ? "B" : "A")}
            disabled={isRecording || isProcessing}
          >
            Switch to Speaker {currentSpeaker === "A" ? "B" : "A"}
          </Button>
          
          {lastMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepeatLastMessage}
              disabled={isMuted}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Repeat Last
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};