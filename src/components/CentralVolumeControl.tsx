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
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      <div className="bg-background/95 rounded-2xl border border-border p-6 shadow-lg">
        <div className="flex flex-col items-center gap-6">
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

          {/* Volume Control - Vertical */}
          <div className="flex flex-col items-center gap-3">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <div className="h-32 flex items-center">
              <Slider
                value={[Math.round(volume * 100)]}
                onValueChange={(value) => onVolumeChange(value[0] / 100)}
                max={100}
                step={5}
                orientation="vertical"
                className="h-full"
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            className="h-10 w-10 rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};