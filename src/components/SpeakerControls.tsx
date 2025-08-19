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
        isTop ? "bottom-6 left-5" : "bottom-6 left-5"
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenVoiceSelection}
          className="h-10 w-10 rounded-full theme-icon-button hover:theme-icon-button-hover"
          title={`Voice Selection for Speaker ${speaker}`}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Right Control - Dark/Light Mode */}
      <div className={cn(
        "absolute pointer-events-auto",
        isTop ? "bottom-6 right-5" : "bottom-6 right-5"
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-10 w-10 rounded-full theme-icon-button hover:theme-icon-button-hover"
          title={isDarkMode ? "Switch to Light Bubbles" : "Switch to Dark Bubbles"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};