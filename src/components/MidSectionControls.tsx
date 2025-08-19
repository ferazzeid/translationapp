import { Volume2, Eraser, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { CentralLoadingAnimation } from "./CentralLoadingAnimation";

interface MidSectionControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onWipeMessages: () => void;
  onPassTurn: () => void;
  hasMessages: boolean;
  isManagedMode?: boolean;
  isProcessing?: boolean;
  isRecording?: boolean;
  currentStep?: string;
  speaker?: "A" | "B";
}

export const MidSectionControls = ({
  volume,
  onVolumeChange,
  onWipeMessages,
  onPassTurn,
  hasMessages,
  isManagedMode = false,
  isProcessing = false,
  isRecording = false,
  currentStep,
  speaker
}: MidSectionControlsProps) => {
  return (
    <div className="w-full h-full flex items-center justify-between px-5">
      {/* Left: Volume Slider - Fixed width, not flexible */}
      <div className="flex items-center gap-3 w-32">
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

      {/* Center: Loading Animation Only */}
      <div className="flex-1 flex items-center justify-center">
        <CentralLoadingAnimation
          isProcessing={isProcessing}
          isRecording={isRecording}
        />
      </div>

      {/* Right: Action Buttons - Fixed position with proper spacing */}
      <div className="flex items-center gap-6">
           {/* Pass Turn Button */}
           {isManagedMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPassTurn}
                className="min-h-[44px] min-w-[44px] h-12 w-12 rounded-full button--strong transition-all duration-200"
                title="Pass turn to other speaker"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
           )}

           {/* Wipe Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onWipeMessages}
              disabled={!hasMessages}
              className="min-h-[44px] min-w-[44px] h-12 w-12 rounded-full button--strong disabled:opacity-50 transition-all duration-200"
              title="Clear all messages"
            >
              <Eraser className="h-5 w-5" />
            </Button>
        </div>
    </div>
  );
};