import { useState } from "react";
import { Play, Volume2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IntroductionModeProps {
  targetLanguage: string;
  onContinueToTranslation: () => void;
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

export const IntroductionMode = ({ targetLanguage, onContinueToTranslation }: IntroductionModeProps) => {
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
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-accent rounded-full flex items-center justify-center shadow-medium">
          <Volume2 size={32} className="text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Introduction</h1>
        <p className="text-muted-foreground">Choose a phrase to introduce the app to the other person</p>
      </div>

      <div className="space-y-3">
        {INTRO_PHRASES.map((phrase) => {
          const Icon = phrase.icon;
          const isCurrentlyPlaying = isPlaying === phrase.id;
          
          return (
            <Card 
              key={phrase.id}
              className={cn(
                "p-4 transition-all cursor-pointer",
                selectedPhrase === phrase.id && "ring-2 ring-primary bg-primary/5",
                isCurrentlyPlaying && "shadow-glow"
              )}
              onClick={() => setSelectedPhrase(phrase.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">{phrase.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {phrase.english}
                  </p>
                  <Button
                    size="sm"
                    variant={isCurrentlyPlaying ? "destructive" : "outline"}
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentlyPlaying) {
                        stopSpeech();
                      } else {
                        handlePlayPhrase(phrase.id);
                      }
                    }}
                  >
                    <Play size={16} className="mr-2" />
                    {isCurrentlyPlaying ? "Stop" : "Play in " + targetLanguage}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <Button
          className="w-full h-12 bg-gradient-primary shadow-medium"
          onClick={onContinueToTranslation}
        >
          Continue to Translation
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-12"
          onClick={onContinueToTranslation}
        >
          Skip Introduction
        </Button>
      </div>
    </div>
  );
};