import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWA } from "@/hooks/usePWA";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useManagedMode } from "@/hooks/useManagedMode";
import { useVoiceGenderDetection } from "@/hooks/useVoiceGenderDetection";
import { getLanguageCode } from "@/constants/languages";
import { SpeechBubble } from "./SpeechBubble";
import { MidSectionControls } from "./MidSectionControls";
import { SpeakerButton } from "./SpeakerButton";
import { SpeakerControls } from "./SpeakerControls";
import { SpeakerSection } from "./SpeakerSection";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { pipelineOptimizer } from "@/utils/pipelineOptimizer";
import { voicePrewarming } from "@/utils/voicePrewarming";
import { performanceAnalytics } from "@/utils/performanceAnalytics";

import { RecordingCountdown } from "./RecordingCountdown";


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
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>("");
  
  // Individual settings for each speaker
  const [speakerAVoice, setSpeakerAVoice] = useState("alloy");
  const [speakerBVoice, setSpeakerBVoice] = useState("nova");
  const [activeVoiceModal, setActiveVoiceModal] = useState<"A" | "B" | null>(null);
  const [speakerAGenderDetected, setSpeakerAGenderDetected] = useState(false);
  const [speakerBGenderDetected, setSpeakerBGenderDetected] = useState(false);
  const [voicesPrewarmed, setVoicesPrewarmed] = useState(false);
  
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const audioRecorderA = useAudioRecorder();
  const audioRecorderB = useAudioRecorder();
  const isMobile = useIsMobile();
  const { isStandalone } = usePWA();
  const wakeLock = useWakeLock();
  const [initialManagedModeEnabled, setInitialManagedModeEnabled] = useState(false);
  const managedMode = useManagedMode(initialManagedModeEnabled);
  const voiceGenderDetection = useVoiceGenderDetection();
  
  // Determine if we're on a real mobile device (not desktop with mobile frame)
  const isRealMobile = isMobile || isStandalone;



  // Load admin settings and manage features - ONLY ON MOUNT
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        console.log('TranslationInterface: Loading admin settings from database...');
        const { data, error } = await supabase
          .from("admin_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

        if (error) throw error;

        data?.forEach((setting) => {
          const value = setting.setting_value === "true";

          switch (setting.setting_key) {
            case "wake_lock_enabled":
              if (value && wakeLock.isSupported) {
                wakeLock.request();
              }
              break;
            case "managed_mode_enabled":
              console.log('Admin settings: managed_mode_enabled =', value);
              setInitialManagedModeEnabled(value);
              managedMode.setEnabled(value);
              break;
            case "hold_to_record_enabled":
              setHoldToRecordMode(value);
              break;
          }
        });
      } catch (error: any) {
        console.error('Error loading admin settings:', error);
      }
    };

    loadAdminSettings();
  }, []); // EMPTY DEPENDENCY ARRAY - only run once on mount

  // Voice prewarming effect - SESSION-BASED (only once per session)
  useEffect(() => {
    const prewarmVoices = async () => {
      if (!speakerAVoice || !speakerBVoice) return;

      // Check if voices already prewarmed in this session
      const sessionKey = `prewarmed_${speakerAVoice}_${speakerBVoice}_${speakerALanguage}_${speakerBLanguage}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Voices already prewarmed in this session, skipping...');
        return;
      }

      console.log('Prewarming voices for session...');
      await voicePrewarming.prewarmVoicePair(
        speakerAVoice, 
        speakerBVoice, 
        speakerALanguage, 
        speakerBLanguage
      );
      
      // Mark as prewarmed for this session
      sessionStorage.setItem(sessionKey, 'true');
    };

    prewarmVoices();
  }, [speakerAVoice, speakerBVoice, speakerALanguage, speakerBLanguage]);

  // Initialize performance analytics session
  useEffect(() => {
    performanceAnalytics.generateSessionId();
  }, []);

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
        await audioRecorderA.startRecording(60000); // 60 second limit
      } else {
        if (audioRecorderA.isRecording) {
          await audioRecorderA.stopRecording();
        }
        setIsListeningA(false);
        setIsListeningB(true);
        await audioRecorderB.startRecording(60000); // 60 second limit
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
        
        // Perform voice gender detection for first-time speakers
        if (success && audioData) {
          const isFirstTime = speaker === "A" ? !speakerAGenderDetected : !speakerBGenderDetected;
          if (isFirstTime) {
            try {
              // Convert base64 to blob for gender detection
              const binaryString = atob(audioData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const audioBlob = new Blob([bytes], { type: 'audio/webm' });
              
              const genderResult = await voiceGenderDetection.detectGender(audioBlob);
              const recommendedVoice = voiceGenderDetection.getDefaultVoiceForGender(genderResult.gender);
              
              // Auto-assign voice based on detected gender
              if (speaker === "A") {
                setSpeakerAVoice(recommendedVoice);
                setSpeakerAGenderDetected(true);
              } else {
                setSpeakerBVoice(recommendedVoice);
                setSpeakerBGenderDetected(true);
              }
              
              console.log(`Auto-assigned ${genderResult.gender} voice "${recommendedVoice}" for Speaker ${speaker}`);
            } catch (error) {
              console.error('Voice gender detection failed:', error);
            }
          }
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
    setCurrentProcessingStep("");
    
    try {
      const isFromA = speaker === "A";
      const originalLang = isFromA ? speakerALanguage : speakerBLanguage;
      const targetLang = isFromA ? speakerBLanguage : speakerALanguage;
      const voiceToUse = speaker === "A" ? speakerAVoice : speakerBVoice;

      // Validate audio data before processing
      if (!audioData || audioData.length < 100) {
        toast({
          title: "Recording Too Short",
          description: "Please speak longer for better recognition.",
          variant: "destructive"
        });
        return false;
      }

      // Use simple pipeline processor
      const result = await pipelineOptimizer.processAudioOptimized(
        audioData,
        speaker,
        originalLang,
        targetLang,
        voiceToUse,
        setCurrentProcessingStep
      );

      if (!result.success) {
        toast({
          title: "Processing Error",
          description: result.error || "Failed to process audio",
          variant: "destructive"
        });
        return false;
      }

      // Step 3: Add message to conversation
      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        originalText: result.originalText,
        translatedText: result.translatedText || "",
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev]);

      // Play the audio
      if (result.audioData) {
        if (result.audioData === 'streaming') {
          // Audio is already playing via streaming
          console.log('Audio streaming completed');
        } else if (Array.isArray(result.audioData)) {
          // Play chunked audio sequentially
          for (const chunk of result.audioData) {
            await playAudio(chunk);
          }
        } else {
          // Play single audio file
          await playAudio(result.audioData);
        }
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
      setCurrentProcessingStep("");
    }
  };

  const playAudio = async (audioBase64: string | string[]) => {
    if (!isSpeakerEnabled) {
      console.log('Speaker is disabled, skipping audio playback');
      return;
    }
    
    try {
      setIsPlayingAudio(true);
      
      // Handle both single audio and chunked audio
      const audioChunks = Array.isArray(audioBase64) ? audioBase64 : [audioBase64];
      
      // Play each chunk sequentially
      for (const chunk of audioChunks) {
        const audioData = `data:audio/mp3;base64,${chunk}`;
        const audio = new Audio(audioData);
        audio.volume = volume;
        currentAudioRef.current = audio;
        
        // Wait for audio to finish playing before starting next chunk
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = reject;
          audio.play().catch(reject);
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlayingAudio(false);
      currentAudioRef.current = null;
    }
  };

  const cancelVoicePlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
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
          flag={getLanguageCode(speakerBLanguage)}
          isTop={true}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "B"}
          isManagedMode={managedMode.isEnabled}
          holdToRecordMode={holdToRecordMode}
          holdProgress={holdProgressB}
          onHoldStart={() => handleHoldStart("B")}
          onHoldEnd={() => handleHoldEnd("B")}
          recordingDuration={audioRecorderB.recordingDuration}
          isProcessing={isProcessing}
          activeSpeaker={isListeningA ? "A" : isListeningB ? "B" : undefined}
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
          onOpenSettings={onOpenSettings}
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
          onCancelVoice={cancelVoicePlayback}
          hasMessages={messages.length > 0}
          isManagedMode={managedMode.isEnabled}
          isProcessing={isProcessing}
          isRecording={isListeningA || isListeningB}
          isPlayingAudio={isPlayingAudio}
          currentStep={currentProcessingStep}
          speaker={isListeningA ? "A" : isListeningB ? "B" : undefined}
          speakerALanguage={speakerALanguage}
          speakerBLanguage={speakerBLanguage}
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
          flag={getLanguageCode(speakerALanguage)}
          isTop={false}
          className={isRealMobile ? "h-full" : ""}
          isCurrentTurn={managedMode.currentTurn === "A"}
          isManagedMode={managedMode.isEnabled}
          holdToRecordMode={holdToRecordMode}
          holdProgress={holdProgressA}
          onHoldStart={() => handleHoldStart("A")}
          onHoldEnd={() => handleHoldEnd("A")}
          recordingDuration={audioRecorderA.recordingDuration}
          isProcessing={isProcessing}
          activeSpeaker={isListeningA ? "A" : isListeningB ? "B" : undefined}
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
          onOpenSettings={onOpenSettings}
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


    </div>
  );
};