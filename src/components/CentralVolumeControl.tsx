import { Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  isOnline: boolean;
}

export const CentralVolumeControl = ({
  isOnline
}: CentralVolumeControlProps) => {
  const ConnectionIcon = isOnline ? Wifi : WifiOff;
  return (
    <div className="flex items-center justify-center">
      {/* Connection Status Icon */}
      <div className="flex items-center">
        <ConnectionIcon 
          className={cn(
            "h-5 w-5 text-foreground"
          )} 
        />
      </div>
    </div>
  );
};