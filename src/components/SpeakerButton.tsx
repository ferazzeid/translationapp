import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakerButtonProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  language: string;
  flag: string;
  size?: "sm" | "lg";
  className?: string;
}

export const SpeakerButton = ({
  speaker,
  isListening,
  onStart,
  onStop,
  language,
  flag,
  size = "lg",
  className
}: SpeakerButtonProps) => {
  const buttonSize = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const micSize = size === "sm" ? "h-6 w-6" : "h-10 w-10";
  
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Microphone button */}
      <Button
        variant="outline"
        className={cn(
          buttonSize,
          "rounded-full border-2 transition-all duration-200",
          "bg-background hover:scale-105 active:scale-95",
          isListening && [
            speaker === "A" 
              ? "border-primary bg-primary/5 text-primary" 
              : "border-accent bg-accent/5 text-accent"
          ],
          !isListening && "border-border hover:border-muted-foreground"
        )}
        onMouseDown={onStart}
        onMouseUp={onStop}
        onTouchStart={onStart}
        onTouchEnd={onStop}
      >
        <Mic className={micSize} />
      </Button>

      {/* Language abbreviation with flag */}
      <div className="flex items-center gap-1">
        <span className="text-sm">{flag}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {language.toUpperCase()}
        </span>
      </div>
    </div>
  );
};