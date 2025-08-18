import { Mic2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakerControlsProps {
  speaker: "A" | "B";
  onOpenVoiceSelection: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isTop?: boolean;
}

export const SpeakerControls = ({
  speaker,
  onOpenVoiceSelection,
  isDarkMode,
  onToggleDarkMode,
  isTop = false
}: SpeakerControlsProps) => {
  return (
    <div className={cn(
      "absolute right-2 z-20 flex gap-2",
      isTop ? "bottom-2" : "top-2"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenVoiceSelection}
        className="h-8 w-8 rounded-full border border-accent/30 bg-background/80"
        title={`Voice Selection for Speaker ${speaker}`}
      >
        <Mic2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDarkMode}
        className="h-8 w-8 rounded-full border border-border/30 bg-background/80"
        title={isDarkMode ? "Switch to Light Bubbles" : "Switch to Dark Bubbles"}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
};