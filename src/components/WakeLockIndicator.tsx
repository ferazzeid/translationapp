import { Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WakeLockIndicatorProps {
  isActive: boolean;
  isSupported: boolean;
  onToggle: () => void;
  className?: string;
}

export const WakeLockIndicator = ({
  isActive,
  isSupported,
  onToggle,
  className
}: WakeLockIndicatorProps) => {
  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        "h-8 w-8 rounded-full theme-icon-button hover:theme-icon-button-hover border",
        isActive && "text-primary ring-2 ring-primary/20",
        className
      )}
      title={isActive ? "Screen lock prevented" : "Allow screen lock"}
    >
      {isActive ? (
        <Shield className="h-3 w-3" />
      ) : (
        <ShieldOff className="h-3 w-3" />
      )}
    </Button>
  );
};