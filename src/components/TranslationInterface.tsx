import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWA } from "@/hooks/usePWA";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useManagedMode } from "@/hooks/useManagedMode";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { SpeakerSection } from "./SpeakerSection";
import { SpeechBubble } from "./SpeechBubble";
import { AdminControls } from "./AdminControls";
import { ConnectionStatus } from "./ConnectionStatus";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { WakeLockIndicator } from "./WakeLockIndicator";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { SimpleLanguageModal } from "./SimpleLanguageModal";
import { Button } from "@/components/ui/button";
import { VolumeX, Volume2, Settings } from "lucide-react";

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
  onSignOut?: () => void;
  onLanguageChange?: (speakerA: string, speakerB: string) => void;
}

export const TranslationInterface = ({ 
  speakerALanguage, 
  speakerBLanguage, 
  onOpenSettings, 
  onOpenAdminSettings, 
  onSignOut,
  onLanguageChange
}: TranslationInterfaceProps) => {
  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Individual settings for each speaker
  const [speakerAVoice, setSpeakerAVoice] = useState("alloy");
  const [speakerBVoice, setSpeakerBVoice] = useState("nova");
  const [activeVoiceModal, setActiveVoiceModal] = useState<"A" | "B" | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const audioRecorderA = useAudioRecorder();
  const audioRecorderB = useAudioRecorder();
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

  // Load admin settings
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const { data: settings, error } = await supabase
          .from('admin_settings')
          .select('*');

        if (error) throw error;

        settings?.forEach((setting) => {
          switch (setting.setting_key) {
            case "wake_lock_enabled":
              if (setting.setting_value === "true" && wakeLock.isSupported) {
                wakeLock.request();
              }
              break;
            case "managed_mode_enabled":
              managedMode.setEnabled(setting.setting_value === "true");
              break;
          }
        });
      } catch (error: any) {
        console.error('Error loading admin settings:', error);
      }
    };

    loadAdminSettings();
  }, [wakeLock, managedMode]);

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
    if (!managedMode.canSpeak(speaker)) {
      toast({
        title: "Not Your Turn",
        description: `Wait for Speaker ${speaker === "A" ? "B" : "A"} to finish speaking.`,
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const audioRecorder = speaker === "A" ? audioRecorderA : audioRecorderB;
      await audioRecorder.startRecording();
      
      if (speaker === "A") {
        setIsListeningA(true);
      } else {
        setIsListeningB(true);
      }

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

  const stopListening = async (speaker: "A" | "B") => {
    const audioRecorder = speaker === "A" ? audioRecorderA : audioRecorderB;
    
    if (!audioRecorder.isRecording) return;

    try {
      if (speaker === "A") {
        setIsListeningA(false);
      } else {
        setIsListeningB(false);
      }

      setIsProcessing(true);

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

      // Handle both blob and string types
      const audioBlob = typeof audioData === 'string' 
        ? new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/mp3' })
        : audioData;

      await processTranslation(audioBlob, speaker);
      
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

    // Convert audio to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    // Speech to text
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

    // Translate text
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

    // Create message
    const newMessage: Message = {
      id: `${Date.now()}-${speaker}`,
      speaker,
      originalText,
      translatedText,
      timestamp: new Date()
    };

    setMessages(prev => [newMessage, ...prev]);

    // Text to speech for the translation
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

  const handleRepeat = async (speakerRequesting: "A" | "B") => {
    if (isMuted) return;

    const lastMessageFromOtherSpeaker = messages.find(
      msg => msg.speaker !== speakerRequesting
    );

    if (!lastMessageFromOtherSpeaker) {
      toast({
        title: "No Message",
        description: "No message to repeat.",
        variant: "destructive",
      });
      return;
    }

    try {
      const textToRepeat = lastMessageFromOtherSpeaker.translatedText;
      const languageForRepeat = speakerRequesting === "A" ? speakerALanguage : speakerBLanguage;
      const voiceForRepeat = lastMessageFromOtherSpeaker.speaker === "A" ? speakerAVoice : speakerBVoice;
      
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: textToRepeat,
          language: languageForRepeat,
          voice: voiceForRepeat
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

  // Yellow Header Component matching your design
  const YellowHeader = () => (
    <div className="h-16 bg-primary flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <ConnectionStatus isOnline={isOnline} />
        <WakeLockIndicator 
          isActive={wakeLock.isActive}
          isSupported={wakeLock.isSupported}
          onToggle={() => wakeLock.isActive ? wakeLock.release() : wakeLock.request()}
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground hover:bg-primary-foreground/10"
        onClick={onOpenSettings}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );

  // Create messages for each speaker
  const getMessagesForSpeaker = (speaker: "A" | "B") => {
    return messages
      .filter(msg => msg.speaker !== speaker)
      .map((msg, index) => (
        <SpeechBubble
          key={msg.id}
          text={msg.translatedText}
          index={index}
          speaker={msg.speaker}
          isNew={index === 0}
        />
      ));
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
      {/* Fixed Yellow Header */}
      <YellowHeader />
      
      {/* Main Split Screen Content */}
      <div className="h-[calc(100vh-4rem)] relative">
        <SplitScreenLayout
          topContent={
            <SpeakerSection
              speaker="A"
              isListening={isListeningA}
              onStart={() => startListening("A")}
              onStop={() => stopListening("A")}
              onRepeat={() => handleRepeat("A")}
              language={getLanguageName(speakerALanguage)}
              flag=""
              messages={getMessagesForSpeaker("A")}
              isTop={true}
              isCurrentTurn={managedMode.currentTurn === "A"}
              isManagedMode={managedMode.isEnabled}
            />
          }
          centerContent={
            <div className="flex items-center justify-center gap-4">
              {isProcessing && (
                <ProcessingIndicator 
                  isProcessing={isProcessing} 
                  speaker={managedMode.currentTurn}
                />
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Volume</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          }
          bottomContent={
            <SpeakerSection
              speaker="B"
              isListening={isListeningB}
              onStart={() => startListening("B")}
              onStop={() => stopListening("B")}
              onRepeat={() => handleRepeat("B")}
              language={getLanguageName(speakerBLanguage)}
              flag=""
              messages={getMessagesForSpeaker("B")}
              isCurrentTurn={managedMode.currentTurn === "B"}
              isManagedMode={managedMode.isEnabled}
            />
          }
        />
      </div>

      {/* Voice Modal */}
      {activeVoiceModal && (
        <VoiceSelectionModal
          isOpen={true}
          onClose={() => setActiveVoiceModal(null)}
          speaker={activeVoiceModal}
          selectedVoice={activeVoiceModal === "A" ? speakerAVoice : speakerBVoice}
          onVoiceSelect={(voice) => {
            if (activeVoiceModal === "A") {
              setSpeakerAVoice(voice);
            } else {
              setSpeakerBVoice(voice);
            }
            setActiveVoiceModal(null);
          }}
        />
      )}

      {/* Language Modal */}
      {isLanguageModalOpen && (
        <SimpleLanguageModal
          isOpen={true}
          onClose={() => setIsLanguageModalOpen(false)}
          speakerALanguage={speakerALanguage}
          speakerBLanguage={speakerBLanguage}
          onLanguagesSave={(speakerA, speakerB) => {
            onLanguageChange?.(speakerA, speakerB);
            setIsLanguageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};