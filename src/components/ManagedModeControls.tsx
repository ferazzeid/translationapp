import { ArrowUpDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Speaker } from "@/hooks/useManagedMode";

interface ManagedModeControlsProps {
  isEnabled: boolean;
  currentTurn: Speaker;
  onSwitchTurn: () => void;
  className?: string;
}

export const ManagedModeControls = ({
  isEnabled,
  currentTurn,
  onSwitchTurn,
  className
}: ManagedModeControlsProps) => {
  if (!isEnabled) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onSwitchTurn}
        className="h-8 bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
        title="Pass turn to other speaker"
      >
        <ArrowUpDown className="h-3 w-3 mr-1" />
        Pass Turn
      </Button>
      
      <div className="flex items-center text-xs text-muted-foreground">
        <span>Speaker {currentTurn}</span>
        <ArrowRight className="h-3 w-3 ml-1" />
      </div>
    </div>
  );
};