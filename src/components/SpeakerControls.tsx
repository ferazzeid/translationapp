import { MessageCircle, Sun, Moon } from "lucide-react";
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
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Left Control - Voice Selection */}
      <div className={cn(
        "absolute pointer-events-auto",
        isTop ? "bottom-6 left-6" : "bottom-6 left-6"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenVoiceSelection}
          className="h-8 w-8 rounded-full bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
          title={`Voice Selection for Speaker ${speaker}`}
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Right Control - Dark/Light Mode */}
      <div className={cn(
        "absolute pointer-events-auto",
        isTop ? "bottom-6 right-6" : "bottom-6 right-6"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-8 w-8 rounded-full bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
          title={isDarkMode ? "Switch to Light Bubbles" : "Switch to Dark Bubbles"}
        >
          {isDarkMode ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
};