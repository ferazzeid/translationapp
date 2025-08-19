import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWA } from "@/hooks/usePWA";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useManagedMode } from "@/hooks/useManagedMode";
import { SpeechBubble } from "./SpeechBubble";
import { CentralVolumeControl } from "./CentralVolumeControl";
import { HorizontalVolumeControl } from "./HorizontalVolumeControl";
import { AdminControls } from "./AdminControls";
import { LanguageSettings } from "./LanguageSettings";
import { ConnectionStatus } from "./ConnectionStatus";
import { SpeakerButton } from "./SpeakerButton";
import { SpeakerControls } from "./SpeakerControls";
import { SpeakerSection } from "./SpeakerSection";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { SimpleLanguageModal } from "./SimpleLanguageModal";
import { TurnIndicatorSettings } from "./TurnIndicatorSettings";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { WakeLockIndicator } from "./WakeLockIndicator";
import { ManagedModeControls } from "./ManagedModeControls";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

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
  const [turnIndicatorColor, setTurnIndicatorColor] = useState("green");
  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  
  // Individual settings for each speaker
  const [speakerAVoice, setSpeakerAVoice] = useState("alloy");
  const [speakerBVoice, setSpeakerBVoice] = useState("nova");
  const [speakerADarkMode, setSpeakerADarkMode] = useState(false);
  const [speakerBDarkMode, setSpeakerBDarkMode] = useState(false);
  const [activeVoiceModal, setActiveVoiceModal] = useState<"A" | "B" | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isTurnSettingsOpen, setIsTurnSettingsOpen] = useState(false);
  
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const audioRecorderA = useAudioRecorder();
  const audioRecorderB = useAudioRecorder();
  const isMobile = useIsMobile();
  const { isStandalone } = usePWA();
  const wakeLock = useWakeLock();
  const managedMode = useManagedMode();
  
  // Determine if we're on a real mobile device (not desktop with mobile frame)
  const isRealMobile = isMobile || isStandalone;

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

  // Load admin settings and manage features
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled"]);

        if (error) throw error;

        data?.forEach((setting) => {
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
    // Check if speaker can speak in managed mode
    if (!managedMode.canSpeak(speaker)) {
      toast({
        title: "Turn Management",
        description: `It's not Speaker ${speaker}'s turn to speak`,
        variant: "destructive"
      });
      return;
    }

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
      } else if (speaker === "B" && audioRecorderB.isRecording) {
        audioData = await audioRecorderB.stopRecording();
      }

      // Always reset the listening state immediately after stopping recording
      // This prevents stuck button states
      if (speaker === "A") {
        setIsListeningA(false);
      } else {
        setIsListeningB(false);
      }

      if (audioData) {
        await processAudioData(audioData, speaker);
        
        // Switch turn in managed mode after successful processing
        if (managedMode.isEnabled) {
          managedMode.switchTurn();
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Ensure states are reset on any error
      setIsListeningA(false);
      setIsListeningB(false);
      toast({
        title: "Recording Error", 
        description: "Failed to stop recording properly.",
        variant: "destructive"
      });
    }
  };

  const processAudioData = async (audioData: string, speaker: "A" | "B") => {
    console.log('Processing audio data for speaker:', speaker);
    
    setIsProcessing(true);
    
    try {
      const isFromA = speaker === "A";
      const originalLang = isFromA ? speakerALanguage : speakerBLanguage;
      const targetLang = isFromA ? speakerBLanguage : speakerALanguage;

      console.log('Languages:', { originalLang, targetLang });

      // Step 1: Speech to text using Whisper API
      console.log('Step 1: Calling speech-to-text...');
      const { data: sttResponse, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: audioData,
          language: originalLang
        }
      });

      console.log('Speech-to-text response:', { sttResponse, sttError });

      if (sttError) {
        console.error('Speech-to-text error:', sttError);
        throw new Error(`Speech-to-text failed: ${sttError.message || 'Unknown error'}`);
      }

      if (!sttResponse?.text) {
        console.error('No text returned from speech-to-text');
        throw new Error('Failed to transcribe audio - no text returned');
      }

      const originalText = sttResponse.text.trim();
      console.log('Transcribed text:', originalText);

      // Step 2: Translate text using GPT-4o
      console.log('Step 2: Calling translate-text...');
      const { data: translateResponse, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: originalText,
          fromLanguage: originalLang,
          toLanguage: targetLang
        }
      });

      console.log('Translation response:', { translateResponse, translateError });

      if (translateError) {
        console.error('Translation error:', translateError);
        throw new Error(`Translation failed: ${translateError.message || 'Unknown error'}`);
      }

      if (!translateResponse?.translatedText) {
        console.error('No translated text returned');
        throw new Error('Failed to translate text - no translation returned');
      }

      const translatedText = translateResponse.translatedText.trim();
      console.log('Translated text:', translatedText);

      // Step 3: Add message to conversation
      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        originalText,
        translatedText,
        timestamp: new Date()
      };

      console.log('Adding new message:', newMessage);

      setMessages(prev => {
        const updated = [newMessage, ...prev];
        console.log('Updated messages:', updated);
        return updated;
      });

      // Step 4: Text to speech for the translation
      console.log('Step 4: Calling text-to-speech...');
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          language: targetLang
        }
      });

      console.log('Text-to-speech response:', { ttsResponse, ttsError });

      if (!ttsError && ttsResponse?.audioData) {
        playAudio(ttsResponse.audioData);
      } else if (ttsError) {
        console.warn('Text-to-speech failed:', ttsError);
      }

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error", 
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioBase64: string) => {
    if (!isSpeakerEnabled) {
      console.log('Speaker is disabled, skipping audio playback');
      return;
    }
    
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

  const clearAllMessages = () => {
    setMessages([]);
  };

  const repeatLastMessage = async (speakerRequesting: "A" | "B") => {
    // Find the last message from the OTHER speaker (what they want to hear repeated)
    const lastMessageFromOtherSpeaker = messages.find(message => message.speaker !== speakerRequesting);
    
    if (lastMessageFromOtherSpeaker) {
      try {
        // Replay the translated text that was meant for the requesting speaker
        const textToRepeat = lastMessageFromOtherSpeaker.translatedText;
        const languageForRepeat = speakerRequesting === "A" ? speakerALanguage : speakerBLanguage;
        
        const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: textToRepeat,
            language: languageForRepeat
          }
        });

        if (!ttsError && ttsResponse?.audioData) {
          playAudio(ttsResponse.audioData);
          
          // Show a visual indicator that the message was repeated
          toast({
            title: "Message Repeated",
            description: `"${textToRepeat.substring(0, 50)}${textToRepeat.length > 50 ? '...' : ''}"`,
          });
        }
      } catch (error) {
        console.error('Error repeating message:', error);
        toast({
          title: "Repeat Failed",
          description: "Could not repeat the last message",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "No Message to Repeat",
        description: "There are no previous messages to repeat",
        variant: "destructive"
      });
    }
  };

  const getRecentMessages = (viewerSpeaker: "A" | "B") => {
    // Each speaker sees ALL recent messages (both their own and translated from other speaker)
    // Keep up to 50 messages - they persist until replaced due to space constraints
    return messages.slice(0, 50);
  };

  return (
    <div className={cn(
      "flex flex-col bg-background overflow-hidden",
      isRealMobile ? "h-[100dvh] w-full" : "h-full w-full"
    )}>
      {/* Speaker B Half - Top (Rotated 180°) - Other Person */}
      <div 
        className={cn(
          "rotate-180 relative transition-all duration-500",
          isRealMobile ? "h-[calc(50dvh-2.5rem)]" : "h-1/2"
        )}
        style={{
          backgroundColor: managedMode.isEnabled && managedMode.currentTurn === "B" 
            ? turnIndicatorColor === "green" ? "#f0fdf4" 
            : turnIndicatorColor === "blue" ? "#eff6ff"
            : turnIndicatorColor === "purple" ? "#faf5ff"
            : turnIndicatorColor === "yellow" ? "#fefce8"
            : turnIndicatorColor === "pink" ? "#fdf2f8"
            : turnIndicatorColor === "orange" ? "#fff7ed"
            : "#f0fdf4"
            : "transparent"
        }}
      >
        <SpeakerSection
          speaker="B"
          isListening={isListeningB}
          onStart={() => startListening("B")}
          onStop={() => stopListening("B")}
          onRepeat={() => repeatLastMessage("B")}
          language={speakerBLanguage}
          flag={getLanguageFlag(speakerBLanguage)}
          isTop={true}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "B"}
          isManagedMode={managedMode.isEnabled}
          messages={getRecentMessages("B").map((message, index) => (
            <SpeechBubble
              key={`${message.id}-${index}`}
              text={message.speaker === "B" ? message.originalText : message.translatedText}
              isOriginal={message.speaker === "B"}
              index={index}
              speaker={message.speaker}
              isNew={index === 0}
              isDarkMode={speakerBDarkMode}
            />
          )).concat(
            isProcessing ? [
              <ProcessingIndicator 
                key="processing-b"
                isProcessing={true} 
                speaker="B"
              />
            ] : []
          )}
        />
        
        {/* Speaker B Controls - Inside rotated section with relative positioning */}
        <SpeakerControls
          speaker="B"
          onOpenVoiceSelection={() => setActiveVoiceModal("B")}
          isDarkMode={speakerBDarkMode}
          onToggleDarkMode={() => setSpeakerBDarkMode(!speakerBDarkMode)}
          isTop={true}
        />

        {/* Managed Mode Controls for Speaker B - Inside rotated section */}
        {managedMode.isEnabled && (
          <div className="absolute top-4 right-4">
            <ManagedModeControls
              isEnabled={managedMode.isEnabled}
              currentTurn={managedMode.currentTurn}
              onSwitchTurn={managedMode.switchTurn}
              speakerALanguage={speakerALanguage}
              speakerBLanguage={speakerBLanguage}
              speaker="B"
              className="rotate-180"
            />
          </div>
        )}
      </div>

      {/* Central Controls Strip */}
      <div className={cn(
        "flex-shrink-0 bg-background z-30 flex items-center justify-center relative border-t border-b border-border",
        isRealMobile ? "h-20" : "h-20"
      )}>
        {/* Connection Status - Left Side */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <CentralVolumeControl isOnline={isOnline} />
        </div>
        
        {/* Volume Control - Center */}
        <HorizontalVolumeControl
          volume={volume}
          onVolumeChange={setVolume}
          isSpeakerEnabled={isSpeakerEnabled}
          onToggleSpeaker={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
          onClearMessages={clearAllMessages}
          isProcessing={isProcessing}
        />
        
        {/* Right side space for symmetry */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
        </div>
      </div>

      {/* Speaker A Half - Bottom (Normal) - You */}
      <div 
        className={cn(
          "relative transition-all duration-500",
          isRealMobile ? "h-[calc(50dvh-2.5rem)]" : "h-1/2"
        )}
        style={{
          backgroundColor: managedMode.isEnabled && managedMode.currentTurn === "A" 
            ? turnIndicatorColor === "green" ? "#f0fdf4" 
            : turnIndicatorColor === "blue" ? "#eff6ff"
            : turnIndicatorColor === "purple" ? "#faf5ff"
            : turnIndicatorColor === "yellow" ? "#fefce8"
            : turnIndicatorColor === "pink" ? "#fdf2f8"
            : turnIndicatorColor === "orange" ? "#fff7ed"
            : "#f0fdf4"
            : "transparent"
        }}
      >
        <SpeakerSection
          speaker="A"
          isListening={isListeningA}
          onStart={() => startListening("A")}
          onStop={() => stopListening("A")}
          onRepeat={() => repeatLastMessage("A")}
          language={speakerALanguage}
          flag={getLanguageFlag(speakerALanguage)}
          isTop={false}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "A"}
          isManagedMode={managedMode.isEnabled}
          messages={getRecentMessages("A").map((message, index) => (
            <SpeechBubble
              key={`${message.id}-${index}`}
              text={message.speaker === "A" ? message.originalText : message.translatedText}
              isOriginal={message.speaker === "A"}
              index={index}
              speaker={message.speaker}
              isNew={index === 0}
              isDarkMode={speakerADarkMode}
            />
          )).concat(
            isProcessing ? [
              <ProcessingIndicator 
                key="processing-a"
                isProcessing={true} 
                speaker="A"
              />
            ] : []
          )}
        />
        
        {/* Speaker A Controls - Inside section with proper positioning */}
        <SpeakerControls
          speaker="A"
          onOpenVoiceSelection={() => setActiveVoiceModal("A")}
          isDarkMode={speakerADarkMode}
          onToggleDarkMode={() => setSpeakerADarkMode(!speakerADarkMode)}
          isTop={false}
        />

        {/* Managed Mode Controls for Speaker A - Inside section */}
        {managedMode.isEnabled && (
          <div className="absolute top-4 right-4">
            <ManagedModeControls
              isEnabled={managedMode.isEnabled}
              currentTurn={managedMode.currentTurn}
              onSwitchTurn={managedMode.switchTurn}
              speakerALanguage={speakerALanguage}
              speakerBLanguage={speakerBLanguage}
              speaker="A"
            />
          </div>
        )}
      </div>

      {/* Admin Settings - Bottom Left */}
      {onOpenAdminSettings && (
        <AdminControls onOpenAdminSettings={onOpenAdminSettings} />
      )}

      {/* Language Settings - Bottom Right */}
      <LanguageSettings onOpenSettings={() => setIsLanguageModalOpen(true)} />

      {/* Turn Indicator Settings - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsTurnSettingsOpen(true)}
          className="h-8 w-8 rounded-full bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
          title="Turn Indicator Settings"
        >
          <Palette className="h-3 w-3" />
        </Button>
      </div>

      {/* Modals - Outside rotated areas */}
      <VoiceSelectionModal
        isOpen={activeVoiceModal !== null}
        onClose={() => setActiveVoiceModal(null)}
        selectedVoice={activeVoiceModal === "A" ? speakerAVoice : speakerBVoice}
        speaker={activeVoiceModal || "B"}
        onVoiceSelect={(voice) => {
          if (activeVoiceModal === "A") {
            setSpeakerAVoice(voice);
          } else if (activeVoiceModal === "B") {
            setSpeakerBVoice(voice);
          }
          setActiveVoiceModal(null);
        }}
      />

      <SimpleLanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        speakerALanguage={speakerALanguage}
        speakerBLanguage={speakerBLanguage}
        onLanguagesSave={(speakerA, speakerB) => {
          onLanguageChange?.(speakerA, speakerB);
          setIsLanguageModalOpen(false);
        }}
      />

      <TurnIndicatorSettings
        isOpen={isTurnSettingsOpen}
        onClose={() => setIsTurnSettingsOpen(false)}
        currentColor={turnIndicatorColor}
        onColorChange={setTurnIndicatorColor}
      />
    </div>
  );
};