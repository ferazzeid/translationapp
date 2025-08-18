import { Slider } from "@/components/ui/slider";
import { VolumeX, Volume1, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HorizontalVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isSpeakerEnabled: boolean;
  onToggleSpeaker: () => void;
}

export const HorizontalVolumeControl = ({
  volume,
  onVolumeChange,
  isSpeakerEnabled,
  onToggleSpeaker
}: HorizontalVolumeControlProps) => {
  const getVolumeIcon = () => {
    if (!isSpeakerEnabled) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-80 h-12 bg-muted/80 backdrop-blur-sm border border-border rounded-full flex items-center px-4 gap-3">
      {/* Speaker Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSpeaker}
        className={cn(
          "h-8 w-8 rounded-full flex-shrink-0",
          isSpeakerEnabled ? "text-foreground" : "text-muted-foreground"
        )}
        title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
      >
        <VolumeIcon className="h-4 w-4" />
      </Button>

      {/* Horizontal Volume Slider */}
      <div className="flex-1 px-2">
        <Slider
          value={[Math.round(volume * 100)]}
          onValueChange={(value) => onVolumeChange(value[0] / 100)}
          max={100}
          step={5}
          orientation="horizontal"
          className="w-full [&_[role=slider]]:bg-foreground [&_[data-orientation=horizontal]]:bg-border"
          disabled={!isSpeakerEnabled}
        />
      </div>
    </div>
  );
};