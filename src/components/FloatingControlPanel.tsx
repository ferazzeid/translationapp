import { Volume2, Settings, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FloatingControlPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isOnline: boolean;
  onOpenSettings: () => void;
  onRepeatLastMessage: () => void;
  hasMessages: boolean;
}

export const FloatingControlPanel = ({
  volume,
  onVolumeChange,
  isOnline,
  onOpenSettings,
  onRepeatLastMessage,
  hasMessages
}: FloatingControlPanelProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-card/95 backdrop-blur-md rounded-2xl border border-border/50 shadow-strong p-4">
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isOnline ? "bg-connection-good" : "bg-connection-bad"
            )} />
            <ConnectionIcon 
              className={cn(
                "h-4 w-4",
                isOnline ? "text-connection-good" : "text-connection-bad"
              )} 
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-2">
            <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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

          {/* Repeat Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRepeatLastMessage}
            disabled={!hasMessages}
            className="h-8 w-8 rounded-full hover:bg-accent/20 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8 rounded-full hover:bg-accent/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};