import { Wifi, WifiOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isOnline: boolean;
  volume: number;
  className?: string;
}

export const StatusIndicator = ({ isOnline, volume, className }: StatusIndicatorProps) => {
  const connectionColor = isOnline ? "connection-good" : "connection-bad";
  const VolumeIcon = volume > 0 ? Volume2 : VolumeX;
  const WifiIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg theme-surface theme-border border", className)}>
      <div className="flex items-center gap-1">
        <WifiIcon 
          size={20} 
          className={isOnline ? "theme-icon theme-icon-hover" : "theme-icon-muted"} 
        />
        <span className={cn("text-sm font-medium", isOnline ? "theme-text" : "theme-text-muted")}>
          {isOnline ? "Connected" : "Offline"}
        </span>
      </div>
      
      <div className="h-4 w-px theme-border bg-[hsl(var(--theme-border))]" />
      
      <div className="flex items-center gap-1">
        <VolumeIcon 
          size={20} 
          className={volume > 0 ? "theme-icon theme-icon-hover" : "theme-icon-muted"} 
        />
        <span className="text-sm font-medium theme-text">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};