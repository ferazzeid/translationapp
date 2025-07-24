import { Wifi, WifiOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isOnline: boolean;
  volume: number;
  className?: string;
}

export const StatusIndicator = ({ isOnline, volume, className }: StatusIndicatorProps) => {
  const connectionColor = isOnline ? "connection-good" : "connection-bad";
  const volumeIcon = volume > 0 ? Volume2 : VolumeX;
  const wifiIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-card shadow-soft", className)}>
      <div className="flex items-center gap-1">
        {wifiIcon({ 
          size: 20, 
          className: `text-${connectionColor}` 
        })}
        <span className={`text-sm font-medium text-${connectionColor}`}>
          {isOnline ? "Connected" : "Offline"}
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-1">
        {volumeIcon({ 
          size: 20, 
          className: volume > 0 ? "text-foreground" : "text-destructive" 
        })}
        <span className="text-sm font-medium text-foreground">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};