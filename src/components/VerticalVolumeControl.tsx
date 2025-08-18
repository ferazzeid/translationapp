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
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-background/90 backdrop-blur-sm border border-border rounded-full p-3 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        {/* Speaker Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSpeaker}
          className={cn(
            "h-10 w-10 rounded-full",
            isSpeakerEnabled ? "text-foreground" : "text-muted-foreground"
          )}
          title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
        >
          <VolumeIcon className="h-5 w-5" />
        </Button>

        {/* Vertical Volume Slider */}
        <div className="h-32 flex flex-col items-center">
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

        {/* Volume Percentage */}
        <div className="text-xs text-center text-muted-foreground font-mono min-w-8">
          {isSpeakerEnabled ? Math.round(volume * 100) : 0}%
        </div>
      </div>
    </div>
  );
};