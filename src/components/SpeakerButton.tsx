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
      {/* Microphone button with recording feedback */}
      <div className="relative">
        {/* Pulsing ring for recording state */}
        {isListening && (
          <div className={cn(
            "absolute inset-0 rounded-full border-4 animate-ping",
            speaker === "A" ? "border-red-500" : "border-orange-500"
          )} />
        )}
        
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "h-20 w-20 rounded-full transition-all duration-200 relative z-10",
            "hover:scale-105 active:scale-95",
            isListening ? [
              "bg-red-500 text-white shadow-lg shadow-red-500/25 border-0",
              "animate-pulse",
              speaker === "B" && "bg-orange-500 shadow-orange-500/25"
            ] : [
              "bg-background border-border hover:border-muted-foreground",
              "hover:bg-muted/50"
            ]
          )}
          onClick={isListening ? onStop : onStart}
        >
          <Mic className={cn(
            "h-8 w-8 transition-all duration-200",
            isListening && "animate-pulse"
          )} />
        </Button>
      </div>

      {/* Recording status indicator */}
      {isListening && (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            speaker === "A" ? "bg-red-500" : "bg-orange-500"
          )} />
          <span className="text-xs font-medium text-foreground">
            Recording...
          </span>
        </div>
      )}
    </div>
  );
};