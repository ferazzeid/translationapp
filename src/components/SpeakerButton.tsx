import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakerButtonProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  language: string;
  flag: string;
  className?: string;
}

export const SpeakerButton = ({
  speaker,
  isListening,
  onStart,
  onStop,
  language,
  flag,
  className
}: SpeakerButtonProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Language Indicator */}
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50 shadow-soft">
        <span className="text-lg">{flag}</span>
        <span className="text-sm font-medium text-foreground">
          {language.toUpperCase()}
        </span>
      </div>

      {/* Microphone Button */}
      <div className="relative">
        {/* Listening pulse rings */}
        {isListening && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full animate-pulse-glow",
              speaker === "A" 
                ? "bg-primary/20 shadow-glow" 
                : "bg-accent/20 shadow-glow"
            )} 
            style={{ transform: "scale(1.3)" }} 
            />
            <div className={cn(
              "absolute inset-0 rounded-full animate-pulse-glow",
              speaker === "A" 
                ? "bg-primary/10" 
                : "bg-accent/10"
            )} 
            style={{ 
              transform: "scale(1.6)", 
              animationDelay: "0.5s" 
            }} 
            />
          </>
        )}

        <Button
          size="lg"
          variant="outline"
          className={cn(
            "h-20 w-20 rounded-full border-2 transition-all duration-300 relative z-10",
            "bg-card/90 backdrop-blur-sm hover:scale-105 active:scale-95",
            isListening && [
              speaker === "A" 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-accent bg-accent/10 text-accent",
              "shadow-glow"
            ],
            !isListening && "border-border hover:border-muted-foreground"
          )}
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={onStart}
          onTouchEnd={onStop}
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>
    </div>
  );
};