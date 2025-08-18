import { useState, useEffect, useRef } from "react";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { SpeakerSection } from "./SpeakerSection";
import { CentralVolumeControl } from "./CentralVolumeControl";
import { SpeechBubble } from "./SpeechBubble";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  speaker: "A" | "B";
  timestamp: number;
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
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio_transcript.delta') {
      // Handle transcript updates
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.speaker === "B") {
          // Update existing message
          return prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, text: msg.text + event.delta }
              : msg
          );
        } else {
          // Create new message
          return [...prev, {
            id: Date.now().toString(),
            text: event.delta,
            speaker: "B" as const,
            timestamp: Date.now()
          }];
        }
      });
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage, handleConnectionChange);
      await chatRef.current.connect();
      
      toast({
        title: "Connected",
        description: "Translation interface is ready",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsListeningA(false);
    setIsListeningB(false);
  };

  const handleStartA = async () => {
    if (!isConnected) {
      await startConversation();
    }
    setIsListeningA(true);
    console.log('Started listening for Speaker A');
  };

  const handleStopA = () => {
    setIsListeningA(false);
    console.log('Stopped listening for Speaker A');
  };

  const handleStartB = async () => {
    if (!isConnected) {
      await startConversation();
    }
    setIsListeningB(true);
    console.log('Started listening for Speaker B');
  };

  const handleStopB = () => {
    setIsListeningB(false);
    console.log('Stopped listening for Speaker B');
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  const getLanguageFlag = (language: string): string => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
      'hu': '🇭🇺'
    };
    return flags[language] || '🌐';
  };

  // Get recent messages for each speaker
  const getRecentMessages = (speaker: "A" | "B") => {
    return messages
      .filter(msg => msg.speaker === speaker)
      .slice(-3)
      .map((msg, index) => (
        <SpeechBubble
          key={msg.id}
          text={msg.text}
          speaker={speaker}
          index={index}
        />
      ));
  };

  return (
    <SplitScreenLayout
      topContent={
        <SpeakerSection
          speaker="A"
          isListening={isListeningA}
          onStart={handleStartA}
          onStop={handleStopA}
          language={speakerALanguage}
          flag={getLanguageFlag(speakerALanguage)}
          messages={getRecentMessages("A")}
          isTop={true}
        />
      }
      bottomContent={
        <SpeakerSection
          speaker="B"
          isListening={isListeningB}
          onStart={handleStartB}
          onStop={handleStopB}
          language={speakerBLanguage}
          flag={getLanguageFlag(speakerBLanguage)}
          messages={getRecentMessages("B")}
          isTop={false}
        />
      }
      centerContent={
        <CentralVolumeControl
          volume={volume}
          onVolumeChange={setVolume}
          isOnline={isConnected}
          onOpenSettings={onOpenSettings}
        />
      }
    />
  );
};