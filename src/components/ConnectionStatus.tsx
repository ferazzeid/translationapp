import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isOnline: boolean;
}

export const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-background/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg">
      <div className="flex items-center gap-2">
        <ConnectionIcon 
          className={cn(
            "h-4 w-4",
            isOnline ? "text-green-500" : "text-red-500"
          )} 
        />
        <span className={cn(
          "text-xs font-medium",
          isOnline ? "text-green-600" : "text-red-600"
        )}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};