import { Volume2, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isOnline: boolean;
  onOpenSettings: () => void;
}

export const CentralVolumeControl = ({
  volume,
  onVolumeChange,
  isOnline,
  onOpenSettings
}: CentralVolumeControlProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="flex items-center gap-6 w-full max-w-md">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-red-500"
        )} />
        <ConnectionIcon 
          className={cn(
            "h-4 w-4",
            isOnline ? "text-green-500" : "text-red-500"
          )} 
        />
      </div>

      {/* Horizontal Volume Slider */}
      <div className="flex items-center gap-3 flex-1">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[Math.round(volume * 100)]}
          onValueChange={(value) => onVolumeChange(value[0] / 100)}
          max={100}
          step={5}
          orientation="horizontal"
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground min-w-8">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Settings Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenSettings}
        className="h-8 w-8 rounded-full"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};