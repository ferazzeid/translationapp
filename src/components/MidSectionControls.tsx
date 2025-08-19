import { Volume2, Eraser, ArrowUpDown, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MidSectionControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isOnline: boolean;
  onWipeMessages: () => void;
  onPassTurn: () => void;
  hasMessages: boolean;
  isManagedMode?: boolean;
}

// 5-step connection strength indicator
const ConnectionStrengthIndicator = ({ isOnline }: { isOnline: boolean }) => {
  const bars = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={cn(
        "w-1 rounded-sm transition-colors",
        isOnline 
          ? "bg-green-500" 
          : i < 2 ? "bg-red-500" : "bg-gray-300"
      )}
      style={{
        height: `${8 + i * 2}px`
      }}
    />
  ));

  return (
    <div className="flex items-end gap-0.5">
      {bars}
    </div>
  );
};

export const MidSectionControls = ({
  volume,
  onVolumeChange,
  isOnline,
  onWipeMessages,
  onPassTurn,
  hasMessages,
  isManagedMode = false
}: MidSectionControlsProps) => {
  return (
    <div className="w-full h-full flex items-center justify-between px-6">
      {/* Left: 5-Step Connection Indicator */}
      <div className="flex items-center justify-start w-1/3">
        <div className="flex items-center gap-3">
          <ConnectionStrengthIndicator isOnline={isOnline} />
          {isOnline ? (
            <Wifi className="h-4 w-4 text-foreground" />
          ) : (
            <WifiOff className="h-4 w-4 text-foreground" />
          )}
        </div>
      </div>

      {/* Middle: Volume Slider */}
      <div className="flex items-center justify-center w-1/3">
        <div className="flex items-center gap-3 px-4">
          <Volume2 className="h-4 w-4 text-foreground flex-shrink-0" />
          <div className="w-24">
            <Slider
              value={[Math.round(volume * 100)]}
              onValueChange={(value) => onVolumeChange(value[0] / 100)}
              max={100}
              step={5}
              className="w-full [&_.bg-primary]:bg-gray-800 [&_.bg-secondary]:bg-gray-300 [&_[data-state=active]]:bg-gray-800"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground min-w-[2rem] text-center">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Right: Pass Turn and Wipe Buttons */}
      <div className="flex items-center justify-end w-1/3">
        <div className="flex items-center gap-4">
          {/* Pass Turn Button - Large and Prominent */}
          {isManagedMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={onPassTurn}
              className="h-12 w-12 rounded-full bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700 transition-all duration-200"
              title="Pass turn to other speaker"
            >
              <ArrowUpDown className="h-6 w-6" />
            </Button>
          )}

          {/* Wipe Button - Same prominence as Pass Turn */}
          <Button
            variant="outline"
            size="icon"
            onClick={onWipeMessages}
            disabled={!hasMessages}
            className="h-12 w-12 rounded-full bg-gray-600 text-white border-2 border-gray-500 hover:bg-gray-500 disabled:opacity-50 disabled:bg-gray-400 transition-all duration-200"
            title="Clear all messages"
          >
            <Eraser className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};