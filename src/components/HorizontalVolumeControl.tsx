import { Slider } from "@/components/ui/slider";
import { VolumeX, Volume1, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HorizontalVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isSpeakerEnabled: boolean;
  onToggleSpeaker: () => void;
  onClearMessages: () => void;
}

export const HorizontalVolumeControl = ({
  volume,
  onVolumeChange,
  isSpeakerEnabled,
  onToggleSpeaker,
  onClearMessages
}: HorizontalVolumeControlProps) => {
  const getVolumeIcon = () => {
    if (!isSpeakerEnabled) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-72 px-4">
      <div className="flex items-center gap-2 justify-center">
        {/* Speaker Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSpeaker}
          className={cn(
            "h-7 w-7 rounded-full flex-shrink-0 hover:bg-muted",
            isSpeakerEnabled ? "text-foreground" : "text-muted-foreground"
          )}
          title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
        >
          <VolumeIcon className="h-3 w-3" />
        </Button>

        {/* Horizontal Volume Slider - More compact */}
        <div className="flex-1 max-w-44">
          <Slider
            value={[Math.round(volume * 100)]}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            max={100}
            step={5}
            orientation="horizontal"
            className="w-full [&_[role=slider]]:bg-foreground [&_[role=slider]]:border-border [&_[data-orientation=horizontal]]:bg-border [&_[role=slider]:hover]:bg-foreground [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
            disabled={!isSpeakerEnabled}
          />
        </div>

        {/* Clear Messages Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearMessages}
          className="h-7 w-7 rounded-full flex-shrink-0 text-foreground hover:bg-muted"
          title="Clear all messages"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};