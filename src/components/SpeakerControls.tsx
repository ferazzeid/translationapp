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
    <>
      {/* Left Control - Voice Selection */}
      <div className={cn(
        "absolute z-20",
        isTop ? "bottom-4 left-1/2 -translate-x-[calc(100%+60px)]" : "bottom-4 left-1/2 -translate-x-[calc(100%+60px)]"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenVoiceSelection}
          className="h-10 w-10 rounded-full bg-background/90 border border-border shadow-sm hover:bg-accent"
          title={`Voice Selection for Speaker ${speaker}`}
        >
          <Mic2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Right Control - Dark/Light Mode */}
      <div className={cn(
        "absolute z-20",
        isTop ? "bottom-4 left-1/2 translate-x-[60px]" : "bottom-4 left-1/2 translate-x-[60px]"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-10 w-10 rounded-full bg-background/90 border border-border shadow-sm hover:bg-accent"
          title={isDarkMode ? "Switch to Light Bubbles" : "Switch to Dark Bubbles"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
};