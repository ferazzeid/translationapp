import { VolumeX, Volume1, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VerticalVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isSpeakerEnabled: boolean;
  onToggleSpeaker: () => void;
}

export const VerticalVolumeControl = ({
  volume,
  onVolumeChange,
  isSpeakerEnabled,
  onToggleSpeaker
}: VerticalVolumeControlProps) => {
  const getVolumeIcon = () => {
    if (!isSpeakerEnabled) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col items-center gap-3">
        {/* Speaker Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSpeaker}
          className={cn(
            "h-8 w-8 rounded-full p-0",
            isSpeakerEnabled ? "theme-text" : "theme-text-muted"
          )}
          title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
        >
          <VolumeIcon className="h-4 w-4 theme-icon theme-icon-hover" />
        </Button>

        {/* Vertical Volume Slider */}
        <div className="h-24 flex flex-col items-center">
          <Slider
            value={[Math.round(volume * 100)]}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            max={100}
            step={5}
            orientation="vertical"
            className="h-full"
            disabled={!isSpeakerEnabled}
          />
        </div>
      </div>
    </div>
  );
};