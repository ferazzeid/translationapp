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
import { MidSectionControls } from "./MidSectionControls";

import { SpeakerButton } from "./SpeakerButton";
import { SpeakerControls } from "./SpeakerControls";
import { SpeakerSection } from "./SpeakerSection";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { ProcessingIndicator } from "./ProcessingIndicator";


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
  const [lastTurnSwitchTime, setLastTurnSwitchTime] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [holdToRecordMode, setHoldToRecordMode] = useState(false);
  const [holdProgressA, setHoldProgressA] = useState(0);
  const [holdProgressB, setHoldProgressB] = useState(0);
  
  // Individual settings for each speaker
  const [speakerAVoice, setSpeakerAVoice] = useState("alloy");
  const [speakerBVoice, setSpeakerBVoice] = useState("nova");
  const [activeVoiceModal, setActiveVoiceModal] = useState<"A" | "B" | null>(null);
  
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
      en: "EN",
      hu: "HU", 
      es: "ES",
      fr: "FR",
      de: "DE",
      it: "IT",
      pt: "PT",
      zh: "ZH",
      ja: "JA",
      ko: "KO"
    };
    return flags[code] || "??";
  };

  // Load admin settings and manage features
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

        if (error) throw error;

        data?.forEach((setting) => {
          switch (setting.setting_key) {
            case "wake_lock_enabled":
              if (setting.setting_value === "true" && wakeLock.isSupported) {
                wakeLock.request();
              }
              break;
            case "managed_mode_enabled":
              const shouldEnable = setting.setting_value === "true";
              console.log('Admin settings: managed_mode_enabled =', shouldEnable, 'current enabled =', managedMode.isEnabled);
              managedMode.setEnabled(shouldEnable);
              break;
            case "hold_to_record_enabled":
              setHoldToRecordMode(setting.setting_value === "true");
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
    // Prevent starting if audio is currently playing (to avoid feedback)
    if (isPlayingAudio) {
      return;
    }

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
      if (speaker === "A") {
        setIsListeningA(false);
      } else {
        setIsListeningB(false);
      }

      if (audioData) {
        const success = await processAudioData(audioData, speaker);
        
        // Automatically switch turns in managed mode after successful processing
        if (success && managedMode.isEnabled) {
          console.log(`Auto-switching turn after ${speaker} finished speaking`);
          // Add a small delay to make the turn switching feel more natural
          setTimeout(() => {
            managedMode.switchTurn();
          }, 500);
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

  const processAudioData = async (audioData: string, speaker: "A" | "B"): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const isFromA = speaker === "A";
      const originalLang = isFromA ? speakerALanguage : speakerBLanguage;
      const targetLang = isFromA ? speakerBLanguage : speakerALanguage;

      // Validate audio data before processing
      if (!audioData || audioData.length < 100) {
        toast({
          title: "Recording Too Short",
          description: "Please speak longer for better recognition.",
          variant: "destructive"
        });
        return false;
      }

      // Step 1: Speech to text using Whisper API
      console.log(`Processing audio for ${speaker}, size: ${audioData.length} chars`);
      
      const { data: sttResponse, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: audioData,
          language: originalLang
        }
      }).catch(networkError => {
        console.error('Network error calling speech-to-text:', networkError);
        return { data: null, error: { message: `Network error: ${networkError.message}` } };
      });

      if (sttError) {
        console.error('Speech-to-text error details:', sttError);
        
        // Check for successful response with empty transcription (common case)
        if (sttError.message && sttError.message.includes('200')) {
          toast({
            title: "No Speech Detected",
            description: "Please speak more clearly or for a longer duration. Try holding the microphone button longer.",
            variant: "default"
          });
          return false;
        }
        
        // Extract better error message from the actual error
        let errorMessage = "Could not understand the audio. Please try speaking more clearly.";
        if (sttError.message) {
          if (sttError.message.includes('Audio format not supported')) {
            errorMessage = "Audio format issue. Please try recording again.";
          } else if (sttError.message.includes('recording too short')) {
            errorMessage = "Recording too short. Please speak longer.";
          } else if (sttError.message.includes('Network error')) {
            errorMessage = "Connection issue. Please check your internet and try again.";
          } else if (sttError.message.includes('API key not configured')) {
            errorMessage = "Service configuration issue. Please contact support.";
          } else {
            errorMessage = sttError.message;
          }
        }
        
        toast({
          title: "Speech Recognition Issue",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }

      if (!sttResponse?.text || sttResponse.text.trim().length === 0) {
        console.error('Empty text returned from speech-to-text');
        toast({
          title: "No Speech Detected",
          description: "No speech was detected in the recording. Please speak more clearly or for a longer duration.",
          variant: "default"
        });
        return false;
      }

      const originalText = sttResponse.text.trim();

      // Step 2: Translate text using GPT-4o
      const { data: translateResponse, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: originalText,
          fromLanguage: originalLang,
          toLanguage: targetLang
        }
      });

      if (translateError) {
        console.error('Translation error:', translateError);
        throw new Error(`Translation failed: ${translateError.message || 'Unknown error'}`);
      }

      if (!translateResponse?.translatedText) {
        console.error('No translated text returned');
        throw new Error('Failed to translate text - no translation returned');
      }

      const translatedText = translateResponse.translatedText.trim();

      // Step 3: Add message to conversation
      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        originalText,
        translatedText,
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev]);

      // Step 4: Text to speech for the translation
      // Use the ORIGINAL speaker's voice (the person who spoke), not the target listener's voice
      const voiceToUse = speaker === "A" ? speakerAVoice : speakerBVoice;
      
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          language: targetLang,
          voice: voiceToUse
        }
      });

      if (!ttsError && ttsResponse?.audioData) {
        await playAudio(ttsResponse.audioData);
      } else if (ttsError) {
        console.warn('Text-to-speech failed:', ttsError);
      }

      return true; // Success
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error", 
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive"
      });
      return false; // Failure
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioBase64: string) => {
    if (!isSpeakerEnabled) {
      console.log('Speaker is disabled, skipping audio playback');
      return;
    }
    
    try {
      setIsPlayingAudio(true);
      
      const audioData = `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioData);
      audio.volume = volume;
      
      // Wait for audio to finish playing
      await new Promise((resolve, reject) => {
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlayingAudio(false);
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
        // Use the original speaker's voice (who said the message being repeated)
        const voiceForRepeat = lastMessageFromOtherSpeaker.speaker === "A" ? speakerAVoice : speakerBVoice;
        
        const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: textToRepeat,
            language: languageForRepeat,
            voice: voiceForRepeat
          }
        });

        if (!ttsError && ttsResponse?.audioData) {
          await playAudio(ttsResponse.audioData);
          
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

  // Hold-to-record handlers
  const handleHoldStart = (speaker: "A" | "B") => {
    // Start recording immediately when user begins holding
    startListening(speaker);
    
    // Start progress tracking
    const startTime = Date.now();
    const maxDuration = 30000; // 30 seconds max recording
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / maxDuration) * 100, 100);
      
      if (speaker === "A") {
        setHoldProgressA(progress);
      } else {
        setHoldProgressB(progress);
      }
      
      // Continue updating while holding and still recording
      if (progress < 100 && (speaker === "A" ? isListeningA : isListeningB)) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    // Start progress animation
    requestAnimationFrame(updateProgress);
  };

  const handleHoldEnd = (speaker: "A" | "B") => {
    // Always try to stop recording when user releases
    const isCurrentlyRecording = speaker === "A" ? isListeningA : isListeningB;
    
    if (isCurrentlyRecording) {
      stopListening(speaker);
    }
    
    // Reset progress immediately
    if (speaker === "A") {
      setHoldProgressA(0);
    } else {
      setHoldProgressB(0);
    }
  };

  return (
    <div className={cn(
      "flex flex-col theme-bg overflow-hidden",
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
            ? "#dcfce7"  // Light green when Speaker B's turn
            : "transparent"
        }}
      >
        <SpeakerSection
          speaker="B"
          isListening={isListeningB}
          onStart={() => startListening("B")}
          onStop={() => stopListening("B")}
          language={speakerBLanguage}
          flag={getLanguageFlag(speakerBLanguage)}
          isTop={true}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "B"}
          isManagedMode={managedMode.isEnabled}
          holdToRecordMode={holdToRecordMode}
          holdProgress={holdProgressB}
          onHoldStart={() => handleHoldStart("B")}
          onHoldEnd={() => handleHoldEnd("B")}
          messages={getRecentMessages("B").map((message, index) => (
            <SpeechBubble
              key={`${message.id}-${index}`}
              text={message.speaker === "B" ? message.originalText : message.translatedText}
              isOriginal={message.speaker === "B"}
              index={index}
              speaker={message.speaker}
              isNew={index === 0}
            />
          ))}
        />
        
        {/* Speaker B Controls - Inside rotated section with relative positioning */}
        <SpeakerControls
          speaker="B"
          onOpenVoiceSelection={() => setActiveVoiceModal("B")}
          onOpenAdminSettings={onOpenAdminSettings}
          isTop={true}
        />

      </div>

      {/* Central Controls Strip */}
      <div className={cn(
        "flex-shrink-0 theme-console-prominent-bg z-30 border-t border-b theme-console-border",
        isRealMobile ? "h-20" : "h-20"
      )}>
        <MidSectionControls
          volume={volume}
          onVolumeChange={setVolume}
          onWipeMessages={clearAllMessages}
          onPassTurn={() => {
            console.log('Switch turn button clicked. Current turn:', managedMode.currentTurn);
            managedMode.switchTurn();
            console.log('New turn:', managedMode.currentTurn === "A" ? "B" : "A");
          }}
          hasMessages={messages.length > 0}
          isManagedMode={managedMode.isEnabled}
        />
      </div>

      {/* Speaker A Half - Bottom (Normal) - You */}
      <div 
        className={cn(
          "relative transition-all duration-500",
          isRealMobile ? "h-[calc(50dvh-2.5rem)]" : "h-1/2"
        )}
        style={{
          backgroundColor: managedMode.isEnabled && managedMode.currentTurn === "A" 
            ? "#dcfce7"  // Light green when Speaker A's turn
            : "transparent"
        }}
      >
        <SpeakerSection
          speaker="A"
          isListening={isListeningA}
          onStart={() => startListening("A")}
          onStop={() => stopListening("A")}
          language={speakerALanguage}
          flag={getLanguageFlag(speakerALanguage)}
          isTop={false}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "A"}
          isManagedMode={managedMode.isEnabled}
          holdToRecordMode={holdToRecordMode}
          holdProgress={holdProgressA}
          onHoldStart={() => handleHoldStart("A")}
          onHoldEnd={() => handleHoldEnd("A")}
          messages={getRecentMessages("A").map((message, index) => (
            <SpeechBubble
              key={`${message.id}-${index}`}
              text={message.speaker === "A" ? message.originalText : message.translatedText}
              isOriginal={message.speaker === "A"}
              index={index}
              speaker={message.speaker}
              isNew={index === 0}
            />
          ))}
        />
        
        {/* Speaker A Controls - Inside section with proper positioning */}
        <SpeakerControls
          speaker="A"
          onOpenVoiceSelection={() => setActiveVoiceModal("A")}
          onOpenAdminSettings={onOpenAdminSettings}
          isTop={false}
        />

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

      {/* Processing/Recording Indicator */}
      <ProcessingIndicator 
        isProcessing={isProcessing}
        isRecording={isListeningA || isListeningB}
        speaker={isListeningA ? "A" : "B"}
        type={isListeningA || isListeningB ? "recording" : "processing"}
      />

    </div>
  );
};