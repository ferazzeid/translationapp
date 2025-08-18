import { useState, useEffect } from "react";
import { Mic, MicOff, RotateCcw, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "./StatusIndicator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
    <div className="h-screen flex bg-gradient-surface">
      {/* Main Split Screen Area */}
      <div className="flex-1">
        <ResizablePanelGroup direction="vertical">
          {/* Speaker A Panel (Top) */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-speaker-a/5 border-b-2 border-primary/20">
              {/* Speaker A Header */}
              <div className="p-4 bg-speaker-a/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-speaker-a"></div>
                    <span className="font-semibold text-lg">You ({speakerALanguage.toUpperCase()})</span>
                  </div>
                  <Button
                    size="lg"
                    variant={activeSpeaker === "A" ? "destructive" : "default"}
                    className={cn(
                      "h-12 w-12 p-0 rounded-full transition-all",
                      activeSpeaker === "A" && "shadow-glow animate-pulse-glow"
                    )}
                    onClick={() => activeSpeaker === "A" ? stopListening() : startListening("A")}
                    disabled={isListening && activeSpeaker !== "A"}
                  >
                    {activeSpeaker === "A" ? <MicOff size={24} /> : <Mic size={24} />}
                  </Button>
                </div>
                
                {/* Status for A */}
                {isListening && activeSpeaker === "A" && (
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-listening rounded-full text-white shadow-glow animate-pulse-glow">
                      <div className="w-2 h-2 bg-white rounded-full animate-listening-wave"></div>
                      <span className="font-medium">Listening...</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-listening-wave" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Speaker A Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {messages
                    .filter(msg => msg.speaker === "A")
                    .slice(0, 4)
                    .map(msg => (
                      <Card key={msg.id} className="p-4 bg-white/90 shadow-soft">
                        <p className="text-xl font-medium text-foreground mb-2">{msg.original}</p>
                        <p className="text-lg text-muted-foreground">{msg.translated}</p>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Speaker B Panel (Bottom - Rotated) */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-speaker-b/5 transform rotate-180">
              {/* Speaker B Header (appears at bottom when rotated) */}
              <div className="p-4 bg-speaker-b/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-speaker-b"></div>
                    <span className="font-semibold text-lg">Other Person ({speakerBLanguage.toUpperCase()})</span>
                  </div>
                  <Button
                    size="lg"
                    variant={activeSpeaker === "B" ? "destructive" : "default"}
                    className={cn(
                      "h-12 w-12 p-0 rounded-full transition-all",
                      activeSpeaker === "B" && "shadow-glow animate-pulse-glow"
                    )}
                    onClick={() => activeSpeaker === "B" ? stopListening() : startListening("B")}
                    disabled={isListening && activeSpeaker !== "B"}
                  >
                    {activeSpeaker === "B" ? <MicOff size={24} /> : <Mic size={24} />}
                  </Button>
                </div>
                
                {/* Status for B */}
                {isListening && activeSpeaker === "B" && (
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-listening rounded-full text-white shadow-glow animate-pulse-glow">
                      <div className="w-2 h-2 bg-white rounded-full animate-listening-wave"></div>
                      <span className="font-medium">Listening...</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-listening-wave" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Speaker B Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {messages
                    .filter(msg => msg.speaker === "B")
                    .slice(0, 4)
                    .map(msg => (
                      <Card key={msg.id} className="p-4 bg-white/90 shadow-soft">
                        <p className="text-xl font-medium text-foreground mb-2">{msg.original}</p>
                        <p className="text-lg text-muted-foreground">{msg.translated}</p>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Right Side Controls */}
      <div className="w-20 bg-card/50 border-l border-border flex flex-col justify-between p-3">
        {/* Top Controls */}
        <div className="space-y-3">
          <StatusIndicator 
            isOnline={isOnline} 
            volume={volume} 
            className="flex-col items-center text-center p-2"
          />
          
          {onOpenAdminSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAdminSettings}
              className="w-full h-12 flex flex-col items-center gap-1 p-1"
            >
              <Settings size={18} className="text-muted-foreground" />
              <span className="text-xs">Admin</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="w-full h-12 flex flex-col items-center gap-1 p-1"
          >
            <Settings size={18} />
            <span className="text-xs">Settings</span>
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={repeatLastMessage}
            disabled={!lastMessage}
            className="w-full h-12 flex flex-col items-center gap-1 p-1"
          >
            <RotateCcw size={18} />
            <span className="text-xs">Repeat</span>
          </Button>
          
          <div className="flex flex-col items-center gap-2">
            <Volume2 size={18} className="text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer transform -rotate-90 origin-center scale-75"
              style={{ width: '60px', height: '4px' }}
            />
            <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};