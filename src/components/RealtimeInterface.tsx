import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  speaker: "user" | "assistant";
  timestamp: Date;
}

interface RealtimeInterfaceProps {
  speakerALanguage: string;
  speakerBLanguage: string;
  onOpenSettings: () => void;
}

export const RealtimeInterface = ({
  speakerALanguage,
  speakerBLanguage,
  onOpenSettings
}: RealtimeInterfaceProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const { toast } = useToast();
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (message: any) => {
    console.log('Received message:', message);
    
    if (message.type === 'transcript') {
      if (message.speaker === 'assistant') {
        setCurrentTranscript(prev => prev + message.text);
      }
    } else if (message.type === 'speech_started') {
      setIsListening(true);
    } else if (message.type === 'speech_stopped') {
      setIsListening(false);
      if (currentTranscript) {
        setMessages(prev => [{
          id: Date.now().toString(),
          text: currentTranscript,
          speaker: 'assistant',
          timestamp: new Date()
        }, ...prev.slice(0, 4)]);
        setCurrentTranscript("");
      }
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setIsListening(false);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage, handleConnectionChange);
      await chatRef.current.connect();
      
      toast({
        title: "Connected",
        description: "Real-time translation is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    toast({
      title: "Disconnected",
      description: "Real-time translation stopped",
    });
  };

  useEffect(() => {
    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
      }
    };
  }, []);

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

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      {/* Top Section - Hungarian */}
      <div className="absolute inset-x-0 top-0 h-1/2 rotate-180">
        <div className="absolute inset-4 bottom-20 pointer-events-none">
          {messages.filter(msg => msg.speaker === 'assistant').slice(0, 3).map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "absolute transition-all duration-500 ease-out",
                "left-4 max-w-xs rounded-2xl px-4 py-3 shadow-medium backdrop-blur-sm border",
                "bg-primary/90 text-primary-foreground border-primary/20"
              )}
              style={{
                bottom: `${120 + (index * 80)}px`,
                transform: `scale(${index === 0 ? 1 : Math.max(0.7, 1 - (index * 0.15))})`,
                opacity: index === 0 ? 1 : Math.max(0.4, 1 - (index * 0.2)),
                zIndex: 10 - index
              }}
            >
              <p className="break-words text-sm font-medium">{message.text}</p>
            </div>
          ))}
        </div>
        
        {/* Language indicator for Hungarian */}
        <div className="absolute left-4 bottom-4 flex items-center gap-2 rotate-180">
          <span className="text-2xl">{getLanguageFlag(speakerALanguage)}</span>
          <span className="text-sm font-medium text-muted-foreground">
            {speakerALanguage.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Central Control Area */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 z-30 flex items-center justify-center">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-3 flex items-center gap-4">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Real-time Translation
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {isListening ? (
                  <Mic className="h-5 w-5 text-primary animate-pulse" />
                ) : (
                  <MicOff className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isListening ? "Listening..." : "Ready"}
                </span>
              </div>
              
              <Button 
                onClick={endConversation}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
              
              <Button 
                onClick={onOpenSettings}
                variant="ghost"
                size="sm"
              >
                Settings
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - English */}
      <div className="absolute inset-x-0 bottom-0 h-1/2">
        {/* Current transcript display */}
        {currentTranscript && (
          <div className="absolute left-4 bottom-20 max-w-xs rounded-2xl px-4 py-3 shadow-medium backdrop-blur-sm border bg-accent/90 text-accent-foreground border-accent/20 animate-pulse">
            <p className="break-words text-sm font-medium">{currentTranscript}</p>
          </div>
        )}
        
        {/* Language indicator for English */}
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {speakerBLanguage.toUpperCase()}
          </span>
          <span className="text-2xl">{getLanguageFlag(speakerBLanguage)}</span>
        </div>
      </div>

      {/* Visual feedback for listening state */}
      {isListening && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none z-10" />
      )}
    </div>
  );
};