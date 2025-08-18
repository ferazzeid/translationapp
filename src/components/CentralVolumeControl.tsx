import { Volume2, Settings, Wifi, WifiOff, Shield, Mic2, Sun, Moon, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isOnline: boolean;
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
  onOpenVoiceSelection: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSpeakerEnabled: boolean;
  onToggleSpeaker: () => void;
}

export const CentralVolumeControl = ({
  volume,
  onVolumeChange,
  isOnline,
  onOpenSettings,
  onOpenAdminSettings,
  onOpenVoiceSelection,
  isDarkMode,
  onToggleDarkMode,
  isSpeakerEnabled,
  onToggleSpeaker
}: CentralVolumeControlProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;
  const SpeakerIcon = isSpeakerEnabled ? Volume2 : VolumeX;

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

      {/* Volume Control Section */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSpeaker}
          className={cn(
            "h-8 w-8 rounded-full",
            isSpeakerEnabled ? "text-foreground" : "text-muted-foreground"
          )}
          title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
        >
          <SpeakerIcon className="h-4 w-4" />
        </Button>
        <Slider
          value={[Math.round(volume * 100)]}
          onValueChange={(value) => onVolumeChange(value[0] / 100)}
          max={100}
          step={5}
          orientation="horizontal"
          className="flex-1"
          disabled={!isSpeakerEnabled}
        />
        <span className="text-sm text-muted-foreground min-w-8">
          {isSpeakerEnabled ? Math.round(volume * 100) : 0}%
        </span>
      </div>

      {/* Settings Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-8 w-8 rounded-full"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenVoiceSelection}
          className="h-8 w-8 rounded-full border-accent/50 hover:border-accent"
          title="Voice Selection"
        >
          <Mic2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-full"
        >
          <Settings className="h-4 w-4" />
        </Button>
        {onOpenAdminSettings && (
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenAdminSettings}
            className="h-8 w-8 rounded-full border-primary/50 hover:border-primary"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};