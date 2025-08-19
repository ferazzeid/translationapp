import { Volume2, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ConnectionStatus } from "./ConnectionStatus";
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
      {/* Left: Connection Indicator */}
      <div className="flex items-center justify-start w-1/3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isOnline ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {isOnline ? "Connected" : "Offline"}
          </span>
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
              className="w-full"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground min-w-[2rem] text-center">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Right: Wipe and Pass Turn Buttons */}
      <div className="flex items-center justify-end w-1/3">
        <div className="flex items-center gap-4">
          {/* Wipe Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onWipeMessages}
            disabled={!hasMessages}
            className="h-8 w-8 rounded-full hover:bg-muted disabled:opacity-50"
            title="Clear all messages"
          >
            <RotateCcw className="h-4 w-4 text-foreground" />
          </Button>

          {/* Pass Turn Button (only show in managed mode) */}
          {isManagedMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPassTurn}
              className="h-8 w-8 rounded-full hover:bg-muted"
              title="Pass turn to other speaker"
            >
              <SkipForward className="h-4 w-4 text-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};