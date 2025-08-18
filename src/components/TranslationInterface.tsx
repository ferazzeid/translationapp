import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { SpeechBubble } from "./SpeechBubble";
import { CentralVolumeControl } from "./CentralVolumeControl";
import { HorizontalVolumeControl } from "./HorizontalVolumeControl";
import { AdminControls } from "./AdminControls";
import { LanguageSettings } from "./LanguageSettings";
import { ConnectionStatus } from "./ConnectionStatus";
import { SpeakerButton } from "./SpeakerButton";
import { SpeakerControls } from "./SpeakerControls";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { SimpleLanguageModal } from "./SimpleLanguageModal";

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
  
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        const updated = [newMessage, ...prev.slice(0, 4)];
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
      console.error('Error processing audio:', error);
      toast({
        title: "Translation Error",
        description: error.message || "Failed to process audio. Please try again.",
        variant: "destructive"
      });
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

  const getRecentMessages = (viewerSpeaker: "A" | "B") => {
    // Each speaker sees ALL recent messages (both their own and translated from other speaker)
    // Keep up to 50 messages - they persist until replaced due to space constraints
    return messages.slice(0, 50);
  };

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      {/* Speaker A Half - Top (Rotated 180°) */}
      <div className="absolute inset-x-0 top-0 h-1/2 rotate-180">
        {/* Speaker A Microphone Button - At Edge */}
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20">
          <SpeakerButton
            speaker="A"
            isListening={isListeningA}
            onStart={() => startListening("A")}
            onStop={() => stopListening("A")}
            language={speakerALanguage}
            flag={getLanguageFlag(speakerALanguage)}
          />
        </div>

        {/* Speaker A Speech Bubbles - Shows original A messages and translated B messages */}
        <div className="absolute inset-x-0 top-12 bottom-48 overflow-hidden px-2">
          <div className="flex flex-col-reverse py-8 h-full overflow-y-auto scrollbar-hide">
            {getRecentMessages("A").map((message, index) => (
              <div key={`${message.id}-${index}`} className="mb-3">
                <SpeechBubble
                  text={message.speaker === "A" ? message.originalText : message.translatedText}
                  isOriginal={message.speaker === "A"}
                  index={index}
                  speaker={message.speaker}
                  isNew={index === 0}
                  isDarkMode={speakerADarkMode}
                  totalMessages={getRecentMessages("A").length}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Speaker A Controls */}
        <SpeakerControls
          speaker="A"
          onOpenVoiceSelection={() => setActiveVoiceModal("A")}
          isDarkMode={speakerADarkMode}
          onToggleDarkMode={() => setSpeakerADarkMode(!speakerADarkMode)}
          isTop={true}
        />
      </div>
      {/* Horizontal Volume Control - Center Divider */}
      <HorizontalVolumeControl
        volume={volume}
        onVolumeChange={setVolume}
        isSpeakerEnabled={isSpeakerEnabled}
        onToggleSpeaker={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
      />
      
      {/* Central Connection Status */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 z-20 flex items-center justify-center">
        <CentralVolumeControl isOnline={isOnline} />
      </div>

      {/* Speaker B Half - Bottom (Normal) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2">
        {/* Speaker B Microphone Button */}
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20">
          <SpeakerButton
            speaker="B"
            isListening={isListeningB}
            onStart={() => startListening("B")}
            onStop={() => stopListening("B")}
            language={speakerBLanguage}
            flag={getLanguageFlag(speakerBLanguage)}
          />
        </div>

        {/* Speaker B Speech Bubbles - Shows original B messages and translated A messages */}
        <div className="absolute inset-x-0 bottom-12 top-48 overflow-hidden px-2">
          <div className="flex flex-col py-8 h-full overflow-y-auto scrollbar-hide">
            {getRecentMessages("B").map((message, index) => (
              <div key={`${message.id}-${index}`} className="mb-3">
                <SpeechBubble
                  text={message.speaker === "B" ? message.originalText : message.translatedText}
                  isOriginal={message.speaker === "B"}
                  index={index}
                  speaker={message.speaker}
                  isNew={index === 0}
                  isDarkMode={speakerBDarkMode}
                  totalMessages={getRecentMessages("B").length}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Speaker B Controls */}
        <SpeakerControls
          speaker="B"
          onOpenVoiceSelection={() => setActiveVoiceModal("B")}
          isDarkMode={speakerBDarkMode}
          onToggleDarkMode={() => setSpeakerBDarkMode(!speakerBDarkMode)}
          isTop={false}
        />
      </div>

      {/* Visual feedback for listening states */}
      {isListeningA && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-speaker-a/5 animate-pulse pointer-events-none z-10" />
      )}
      {isListeningB && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-speaker-b/5 animate-pulse pointer-events-none z-10" />
      )}

      {/* Admin Settings - Bottom Left */}
      {onOpenAdminSettings && (
        <AdminControls onOpenAdminSettings={onOpenAdminSettings} />
      )}

      {/* Language Settings - Bottom Right */}
      <LanguageSettings onOpenSettings={() => setIsLanguageModalOpen(true)} />

      <VoiceSelectionModal
        isOpen={activeVoiceModal !== null}
        onClose={() => setActiveVoiceModal(null)}
        selectedVoice={activeVoiceModal === "A" ? speakerAVoice : speakerBVoice}
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
        onSpeakerALanguageChange={(lang) => {
          // This would typically update the language in a parent component or context
          console.log('Speaker A language changed to:', lang);
        }}
        onSpeakerBLanguageChange={(lang) => {
          // This would typically update the language in a parent component or context
          console.log('Speaker B language changed to:', lang);
        }}
      />
    </div>
  );
};