import { Slider } from "@/components/ui/slider";
import { VolumeX, Volume1, Volume2, Eraser, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HorizontalVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isSpeakerEnabled: boolean;
  onToggleSpeaker: () => void;
  onClearMessages: () => void;
  isProcessing?: boolean;
  isManagedMode?: boolean;
  onSwitchTurn?: () => void;
}

export const HorizontalVolumeControl = ({
  volume,
  onVolumeChange,
  isSpeakerEnabled,
  onToggleSpeaker,
  onClearMessages,
  isProcessing = false,
  isManagedMode = false,
  onSwitchTurn
}: HorizontalVolumeControlProps) => {
  const getVolumeIcon = () => {
    if (!isSpeakerEnabled) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-80 px-2 sm:px-4">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {/* Speaker Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSpeaker}
          className={cn(
            "h-10 w-10 sm:h-8 sm:w-8 rounded-full flex-shrink-0 hover:bg-muted touch-none",
            isSpeakerEnabled ? "text-foreground" : "text-muted-foreground"
          )}
          title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
        >
          <VolumeIcon className="h-5 w-5 sm:h-4 sm:w-4 theme-icon theme-icon-hover" />
        </Button>

        {/* Horizontal Volume Slider */}
        <div className="flex-1 max-w-32 sm:max-w-32">
          <Slider
            value={[Math.round(volume * 100)]}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            max={100}
            step={5}
            orientation="horizontal"
            className="w-full [&_[role=slider]]:bg-foreground [&_[role=slider]]:border-border [&_[data-orientation=horizontal]]:bg-border [&_[role=slider]:hover]:bg-foreground [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 sm:[&_[role=slider]]:h-4 sm:[&_[role=slider]]:w-4"
            disabled={!isSpeakerEnabled}
          />
        </div>

        {/* Pass Turn Button (only in managed mode) */}
        {isManagedMode && onSwitchTurn ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              console.log('Turn button clicked in HorizontalVolumeControl');
              onSwitchTurn();
            }}
            className="h-12 w-12 sm:h-10 sm:w-10 rounded-full flex-shrink-0 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 hover:text-primary-foreground transition-all duration-200 shadow-lg"
            title="Pass Turn to Other Speaker"
          >
            <ArrowUpDown className="h-6 w-6 sm:h-5 sm:w-5 theme-icon-light" />
          </Button>
        ) : (
          <div className="h-12 w-12 sm:h-10 sm:w-10 flex-shrink-0" />
        )}

        {/* Clear Messages Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onClearMessages}
          className="h-10 w-10 sm:h-8 sm:w-8 rounded-full flex-shrink-0 bg-muted text-foreground border-border hover:bg-muted/80 touch-none"
          title="Clear all messages"
        >
          <Eraser className="h-5 w-5 sm:h-4 sm:w-4 theme-icon theme-icon-hover" />
        </Button>
      </div>
    </div>
  );
};