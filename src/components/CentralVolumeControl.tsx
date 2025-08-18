import { Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isOnline: boolean;
  onOpenSettings: () => void;
}

// Modern 5-bar signal strength indicator
const SignalBars = ({ isOnline }: { isOnline: boolean }) => {
  const signalStrength = isOnline ? 5 : 0; // Full signal when online, none when offline
  
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const barHeight = (i + 1) * 2 + 6; // Heights: 8, 10, 12, 14, 16
        const isActive = i < signalStrength;
        
        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-sm transition-colors",
              isActive 
                ? signalStrength === 5 
                  ? "bg-emerald-500" 
                  : signalStrength >= 3 
                  ? "bg-yellow-500" 
                  : "bg-red-500"
                : "bg-muted"
            )}
            style={{ height: `${barHeight}px` }}
          />
        );
      })}
    </div>
  );
};

export const CentralVolumeControl = ({
  volume,
  onVolumeChange,
  isOnline,
  onOpenSettings
}: CentralVolumeControlProps) => {
  return (
    <div className="flex items-center gap-6 w-full max-w-md">
      {/* Modern Signal Strength */}
      <SignalBars isOnline={isOnline} />

      {/* Volume Slider */}
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