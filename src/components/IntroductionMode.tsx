import { useState } from "react";
import { Play, Volume2, MessageCircle, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IntroductionModeProps {
  targetLanguage: string;
  onContinueToTranslation: () => void;
  onOpenSettings?: () => void;
}

const INTRO_PHRASES = [
  {
    id: "basic",
    title: "Basic Introduction",
    english: "Hello! I'm using a translation app to communicate with you. Can we talk?",
    icon: MessageCircle
  },
  {
    id: "help",
    title: "Need Help",
    english: "Excuse me, I don't speak your language. Can you help me using this translation app?",
    icon: MessageCircle
  },
  {
    id: "friendly",
    title: "Friendly Approach",
    english: "Hi there! I'm a tourist and I'm using this app to translate. Would you mind helping me?",
    icon: MessageCircle
  },
  {
    id: "business",
    title: "Business Context",
    english: "Hello, I'm using a translation app for our conversation. Is this okay with you?",
    icon: MessageCircle
  }
];

export const IntroductionMode = ({ targetLanguage, onContinueToTranslation, onOpenSettings }: IntroductionModeProps) => {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const handlePlayPhrase = async (phraseId: string) => {
    setIsPlaying(phraseId);
    const phrase = INTRO_PHRASES.find(p => p.id === phraseId);
    
    if (phrase) {
      // Simulate text-to-speech - in real implementation, use Web Speech API or service
      const utterance = new SpeechSynthesisUtterance(phrase.english);
      utterance.lang = 'en-US'; // Would be translated to target language
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsPlaying(null);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-surface">
      {/* Header with settings */}
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm border-b border-border/50">
        <h1 className="text-lg font-bold text-foreground">Introduction</h1>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 w-8 p-0"
          >
            <Settings size={16} />
          </Button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-gradient-accent rounded-full flex items-center justify-center shadow-medium">
            <Volume2 size={24} className="text-accent-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Choose a phrase to introduce the app</p>
        </div>

        <div className="space-y-3">
          {INTRO_PHRASES.map((phrase) => {
            const Icon = phrase.icon;
            const isCurrentlyPlaying = isPlaying === phrase.id;
            
            return (
              <Card 
                key={phrase.id}
                className={cn(
                  "p-3 transition-all cursor-pointer",
                  selectedPhrase === phrase.id && "ring-2 ring-primary bg-primary/5",
                  isCurrentlyPlaying && "shadow-glow"
                )}
                onClick={() => setSelectedPhrase(phrase.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-sm text-foreground">{phrase.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {phrase.english}
                    </p>
                    <Button
                      size="sm"
                      variant={isCurrentlyPlaying ? "destructive" : "outline"}
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentlyPlaying) {
                          stopSpeech();
                        } else {
                          handlePlayPhrase(phrase.id);
                        }
                      }}
                    >
                      <Play size={12} className="mr-1" />
                      {isCurrentlyPlaying ? "Stop" : `Play in ${targetLanguage}`}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom buttons */}
      <div className="p-4 space-y-2 bg-white/50 backdrop-blur-sm border-t border-border/50">
        <Button
          className="w-full h-10 bg-gradient-primary shadow-medium flex items-center justify-center gap-2"
          onClick={onContinueToTranslation}
        >
          Continue to Translation
          <ArrowRight size={16} />
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-8 text-sm"
          onClick={onContinueToTranslation}
        >
          Skip Introduction
        </Button>
      </div>
    </div>
  );
};