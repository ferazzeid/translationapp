import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isOnline: boolean;
}

export const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="absolute bottom-2 left-2 z-40">
      <ConnectionIcon 
        className={cn(
          "h-4 w-4",
          isOnline ? "theme-online" : "theme-offline"
        )} 
      />
    </div>
  );
};