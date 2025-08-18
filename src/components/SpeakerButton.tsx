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
    <div className={cn("flex flex-col items-center", className)}>
      <Button
        size="lg"
        variant="outline"
        className={cn(
          "h-20 w-20 rounded-full transition-all duration-300 border-0",
          "hover:scale-105",
          isListening ? [
            "bg-red-500 text-white",
            "animate-[pulse_2s_ease-in-out_infinite]",
            speaker === "B" && "bg-orange-500"
          ] : [
            "bg-background border border-border hover:bg-muted/50"
          ]
        )}
        onClick={isListening ? onStop : onStart}
      >
        <Mic className="h-8 w-8" />
      </Button>
    </div>
  );
};