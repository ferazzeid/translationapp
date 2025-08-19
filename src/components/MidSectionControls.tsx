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
    <div className="w-full h-full flex items-center justify-between px-5">
      {/* Left: Extended Volume Slider (no connection indicators) */}
      <div className="flex items-center justify-start flex-1">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Volume2 className="h-4 w-4 theme-icon theme-icon-hover flex-shrink-0" />
          <div className="flex-1">
            <Slider
              value={[Math.round(volume * 100)]}
              onValueChange={(value) => onVolumeChange(value[0] / 100)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Right: Action Buttons with Equal Spacing */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
           {/* Pass Turn Button */}
           {isManagedMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPassTurn}
                className="min-h-[44px] min-w-[44px] h-12 w-12 rounded-full theme-icon-button hover:theme-icon-button-hover border theme-icon-button-border transition-all duration-200"
                title="Pass turn to other speaker"
              >
                <ArrowUpDown className="h-5 w-5 theme-icon theme-icon-hover" />
              </Button>
           )}

           {/* Wipe Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onWipeMessages}
              disabled={!hasMessages}
              className="min-h-[44px] min-w-[44px] h-12 w-12 rounded-full theme-icon-button hover:theme-icon-button-hover disabled:opacity-50 border theme-icon-button-border transition-all duration-200"
              title="Clear all messages"
            >
              <Eraser className="h-5 w-5 theme-icon theme-icon-hover" />
            </Button>
        </div>
      </div>
    </div>
  );
};