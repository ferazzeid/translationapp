import { Mic, Square } from "lucide-react";
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
    <div className={cn("flex flex-col items-center", className)}>
      <Button
        size="lg"
        variant="ghost"
        className={cn(
          "h-20 w-20 rounded-full transition-all duration-300",
          "hover:scale-105",
          isListening ? [
            "bg-destructive text-destructive-foreground border-0",
            "hover:bg-destructive", // Prevent hover changes when recording
            "recording-pulse" // Use our custom slow pulse animation
          ] : [
            "bg-foreground text-background hover:bg-foreground/80 border border-border"
          ]
        )}
        onClick={isListening ? onStop : onStart}
      >
        {isListening ? (
          <Square className="h-8 w-8 fill-current" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </Button>
    </div>
  );
};