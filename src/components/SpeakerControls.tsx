import { User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakerControlsProps {
  speaker: "A" | "B";
  onOpenVoiceSelection: () => void;
  onOpenAdminSettings?: () => void;
  isTop?: boolean;
}

export const SpeakerControls = ({
  speaker,
  onOpenVoiceSelection,
  onOpenAdminSettings,
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
          <User className="h-4 w-4 theme-icon theme-icon-hover" />
        </Button>
      </div>
      
      {/* Right Control - Admin Settings (only show for one speaker to avoid duplication) */}
      {speaker === "A" && onOpenAdminSettings && (
        <div className={cn(
          "absolute pointer-events-auto",
          isTop ? "bottom-6 right-5" : "bottom-6 right-5"
        )}>
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenAdminSettings}
            className="h-10 w-10 rounded-full theme-icon-button hover:theme-icon-button-hover"
            title="Admin Settings"
          >
            <Settings className="h-4 w-4 theme-icon theme-icon-hover" />
          </Button>
        </div>
      )}
    </div>
  );
};