import { useState, useEffect } from "react";
import { Mic, MicOff, RotateCcw, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  speaker: "A" | "B";
  original: string;
  translated: string;
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
  const [isListening, setIsListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"A" | "B" | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnlineChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, []);

  const startListening = (speaker: "A" | "B") => {
    setIsListening(true);
    setActiveSpeaker(speaker);
    
    // Simulate speech recognition - in real implementation, use Web Speech API
    setTimeout(() => {
      const simulatedMessages = [
        { original: "Hello, how are you?", translated: "Hola, ¿cómo estás?" },
        { original: "Where is the nearest restaurant?", translated: "¿Dónde está el restaurante más cercano?" },
        { original: "Thank you very much!", translated: "¡Muchas gracias!" }
      ];
      
      const randomMessage = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
      const newMessage: Message = {
        id: Date.now().toString(),
        speaker,
        original: speaker === "A" ? randomMessage.original : randomMessage.translated,
        translated: speaker === "A" ? randomMessage.translated : randomMessage.original,
        timestamp: Date.now()
      };
      
      setMessages(prev => [newMessage, ...prev]);
      setLastMessage(newMessage);
      setIsListening(false);
      setActiveSpeaker(null);
      
      // Simulate text-to-speech
      const utterance = new SpeechSynthesisUtterance(newMessage.translated);
      utterance.volume = volume;
      speechSynthesis.speak(utterance);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    setActiveSpeaker(null);
  };

  const repeatLastMessage = () => {
    if (lastMessage) {
      const utterance = new SpeechSynthesisUtterance(lastMessage.translated);
      utterance.volume = volume;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-surface">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <StatusIndicator isOnline={isOnline} volume={volume} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
          >
            <Settings size={20} />
          </Button>
        </div>
        
        {isListening && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-listening rounded-full text-white shadow-glow animate-pulse-glow">
              <div className="w-2 h-2 bg-white rounded-full animate-listening-wave"></div>
              <span className="font-medium">Listening...</span>
              <div className="w-2 h-2 bg-white rounded-full animate-listening-wave" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Split Screen Translation Area */}
      <div className="flex-1 flex flex-col">
        {/* Speaker A Section (Top) */}
        <div className="flex-1 flex flex-col border-b-2 border-primary/20">
          <div className="p-4 bg-speaker-a/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-speaker-a"></div>
                <span className="font-semibold text-sm">You ({speakerALanguage.toUpperCase()})</span>
              </div>
              <Button
                size="sm"
                variant={activeSpeaker === "A" ? "destructive" : "default"}
                className={cn(
                  "transition-all",
                  activeSpeaker === "A" && "shadow-glow animate-pulse-glow"
                )}
                onClick={() => activeSpeaker === "A" ? stopListening() : startListening("A")}
                disabled={isListening && activeSpeaker !== "A"}
              >
                {activeSpeaker === "A" ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            </div>
            
            <div className="h-32 overflow-y-auto space-y-2">
              {messages
                .filter(msg => msg.speaker === "A")
                .slice(0, 3)
                .map(msg => (
                  <Card key={msg.id} className="p-3 bg-white/80">
                    <p className="text-lg font-medium text-foreground">{msg.original}</p>
                    <p className="text-base text-muted-foreground mt-1">{msg.translated}</p>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Speaker B Section (Bottom - Rotated) */}
        <div className="flex-1 flex flex-col transform rotate-180">
          <div className="p-4 bg-speaker-b/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-speaker-b"></div>
                <span className="font-semibold text-sm">Other Person ({speakerBLanguage.toUpperCase()})</span>
              </div>
              <Button
                size="sm"
                variant={activeSpeaker === "B" ? "destructive" : "default"}
                className={cn(
                  "transition-all",
                  activeSpeaker === "B" && "shadow-glow animate-pulse-glow"
                )}
                onClick={() => activeSpeaker === "B" ? stopListening() : startListening("B")}
                disabled={isListening && activeSpeaker !== "B"}
              >
                {activeSpeaker === "B" ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            </div>
            
            <div className="h-32 overflow-y-auto space-y-2">
              {messages
                .filter(msg => msg.speaker === "B")
                .slice(0, 3)
                .map(msg => (
                  <Card key={msg.id} className="p-3 bg-white/80">
                    <p className="text-lg font-medium text-foreground">{msg.original}</p>
                    <p className="text-base text-muted-foreground mt-1">{msg.translated}</p>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={repeatLastMessage}
            disabled={!lastMessage}
          >
            <RotateCcw size={20} className="mr-2" />
            Repeat
          </Button>
          
          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-muted-foreground" />
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
      </div>
    </div>
  );
};