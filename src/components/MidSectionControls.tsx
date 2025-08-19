import { Volume2, Eraser, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MidSectionControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onWipeMessages: () => void;
  onPassTurn: () => void;
  hasMessages: boolean;
  isManagedMode?: boolean;
}

export const MidSectionControls = ({
  volume,
  onVolumeChange,
  onWipeMessages,
  onPassTurn,
  hasMessages,
  isManagedMode = false
}: MidSectionControlsProps) => {
  return (
    <div className="w-full h-full flex items-center justify-between px-4">
      {/* Left: Volume Slider Extended */}
      <div className="flex items-center justify-start w-1/2">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Volume2 className="h-4 w-4 text-foreground flex-shrink-0" />
          <div className="flex-1">
            <Slider
              value={[Math.round(volume * 100)]}
              onValueChange={(value) => onVolumeChange(value[0] / 100)}
              max={100}
              step={5}
              className="w-full [&_[role=slider]]:bg-gray-800 [&_[role=slider]]:border-gray-700 [&_.bg-primary]:bg-gray-800 [&_.bg-secondary]:bg-gray-300 [&_[data-state=active]]:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Right: Pass Turn and Wipe Buttons */}
      <div className="flex items-center justify-end w-1/2">
        <div className="flex items-center gap-4">
          {/* Pass Turn Button - Large with Black Background */}
          {isManagedMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={onPassTurn}
              className="h-12 w-12 rounded-full bg-black text-white border-2 border-black hover:bg-gray-900 transition-all duration-200"
              title="Pass turn to other speaker"
            >
              <ArrowUpDown className="h-6 w-6" />
            </Button>
          )}

          {/* Wipe Button - Black Background (same as Pass Turn) */}
          <Button
            variant="outline"
            size="icon"
            onClick={onWipeMessages}
            disabled={!hasMessages}
            className="h-12 w-12 rounded-full bg-black text-white border-2 border-black hover:bg-gray-900 disabled:opacity-50 disabled:bg-gray-800 transition-all duration-200"
            title="Clear all messages"
          >
            <Eraser className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};