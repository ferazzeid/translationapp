import { Volume2, Eraser, ArrowUpDown, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { CentralLoadingAnimation } from "./CentralLoadingAnimation";
import { SpeakerStatusMessage } from "./SpeakerStatusMessage";

interface MidSectionControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onWipeMessages: () => void;
  onPassTurn: () => void;
  onCancelVoice?: () => void;
  hasMessages: boolean;
  isManagedMode?: boolean;
  isProcessing?: boolean;
  isRecording?: boolean;
  isPlayingAudio?: boolean;
  currentStep?: string;
  speaker?: "A" | "B";
  speakerALanguage?: string;
  speakerBLanguage?: string;
}

export const MidSectionControls = ({
  volume,
  onVolumeChange,
  onWipeMessages,
  onPassTurn,
  onCancelVoice,
  hasMessages,
  isManagedMode = false,
  isProcessing = false,
  isRecording = false,
  isPlayingAudio = false,
  currentStep,
  speaker,
  speakerALanguage = "English",
  speakerBLanguage = "English"
}: MidSectionControlsProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-5">
      {/* CRITICAL FIX: Removed duplicate SpeakerStatusMessage from here
          This was causing duplicate "Feldolgozás..." messages at the top */}

      {/* Main Controls Row */}
      <div className="w-full flex items-center justify-between">
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

        {/* Center: Loading Animation - This handles all central status display */}
        <div className="flex-1 flex items-center justify-center">
          <CentralLoadingAnimation
            isProcessing={isProcessing}
            isRecording={isRecording}
          />
        </div>

        {/* Right: Action Buttons - Compact spacing */}
        <div className="flex items-center gap-3">
          {/* Cancel Voice Button */}
          {isPlayingAudio && onCancelVoice && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelVoice}
              className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-full button--strong transition-all duration-200"
              title="Cancel voice playback"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          )}

          {/* Pass Turn Button */}
          {isManagedMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPassTurn}
              className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-full button--strong transition-all duration-200"
              title="Pass turn to other speaker"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}

          {/* Wipe Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onWipeMessages}
            disabled={!hasMessages}
            className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-full button--strong disabled:opacity-50 transition-all duration-200"
            title="Clear all messages"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};