import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/components/ui/use-toast";
import { SpeechBubble } from "./SpeechBubble";
import { FloatingControlPanel } from "./FloatingControlPanel";
import { SpeakerButton } from "./SpeakerButton";

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

  return (
    <div className="h-full w-full relative bg-gradient-surface overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-gradient-primary" />
      </div>

      {/* Speaker A - Left Side */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20">
        <SpeakerButton
          speaker="A"
          isListening={isListeningA}
          onStart={() => startListening("A")}
          onStop={() => stopListening("A")}
          language={speakerALanguage}
          flag={getLanguageFlag(speakerALanguage)}
        />
      </div>

      {/* Speaker B - Right Side */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
        <SpeakerButton
          speaker="B"
          isListening={isListeningB}
          onStart={() => startListening("B")}
          onStop={() => stopListening("B")}
          language={speakerBLanguage}
          flag={getLanguageFlag(speakerBLanguage)}
        />
      </div>

      {/* Dynamic Speech Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-15">
        {messages.slice(0, 5).map((message, index) => (
          <div key={message.id}>
            {/* Original message bubble */}
            <SpeechBubble
              text={message.originalText}
              isOriginal={true}
              index={index * 2}
              speaker={message.speaker}
              isNew={index === 0}
            />
            {/* Translated message bubble */}
            <SpeechBubble
              text={message.translatedText}
              isOriginal={false}
              index={index * 2 + 1}
              speaker={message.speaker === "A" ? "B" : "A"}
              isNew={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Floating Control Panel */}
      <FloatingControlPanel
        volume={volume}
        onVolumeChange={setVolume}
        isOnline={isOnline}
        onOpenSettings={onOpenSettings}
        onRepeatLastMessage={repeatLastMessage}
        hasMessages={messages.length > 0}
      />

      {/* Visual feedback for listening states */}
      {(isListeningA || isListeningB) && (
        <div className="fixed inset-0 bg-listening-glow/5 animate-pulse-glow pointer-events-none z-5" />
      )}
    </div>
  );
};