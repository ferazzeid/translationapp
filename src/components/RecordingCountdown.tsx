import { cn } from "@/lib/utils";

interface RecordingCountdownProps {
  duration: number; // Current recording duration in milliseconds
  maxDuration: number; // Maximum duration in milliseconds
  className?: string;
}

export const RecordingCountdown = ({ 
  duration, 
  maxDuration, 
  className 
}: RecordingCountdownProps) => {
  const remainingSeconds = Math.ceil((maxDuration - duration) / 1000);
  const progress = (duration / maxDuration) * 100;
  
  // Show countdown only in last 10 seconds
  const showCountdown = remainingSeconds <= 10 && remainingSeconds > 0;
  
  if (!showCountdown) return null;

  return (
    <div className={cn(
      "absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20",
      className
    )}>
      {/* Countdown timer */}
      <div className={cn(
        "text-sm font-bold",
        remainingSeconds <= 3 ? "text-destructive animate-pulse" : "text-muted-foreground"
      )}>
        {remainingSeconds}s
      </div>
      
      {/* Progress bar */}
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-100 ease-out",
            remainingSeconds <= 3 ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};