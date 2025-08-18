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
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Simple microphone button */}
      <Button
        size="lg"
        variant="outline"
        className={cn(
          "h-24 w-24 rounded-full border-2 transition-all duration-200",
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
        <Mic className="h-10 w-10" />
      </Button>

      {/* Language abbreviation with flag */}
      <div className="flex items-center gap-1">
        <span className="text-sm">{flag}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {language.toUpperCase()}
        </span>
      </div>
    </div>
  );
};