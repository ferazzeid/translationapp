import { cn } from "@/lib/utils";

interface HoldToRecordIndicatorProps {
  progress: number; // 0 to 100
  isRecording: boolean;
  className?: string;
}

export const HoldToRecordIndicator = ({ 
  progress, 
  isRecording, 
  className 
}: HoldToRecordIndicatorProps) => {
  return (
    <div className={cn("absolute inset-0 rounded-full pointer-events-none", className)}>
      {/* Progress Ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 transition-opacity duration-200"
        style={{ opacity: isRecording ? 1 : 0 }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="calc(50% - 4px)"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="4"
          strokeOpacity="0.2"
        />
        <circle
          cx="50%"
          cy="50%"
          r="calc(50% - 4px)"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="calc(2 * 3.14159 * (50% - 4px))"
          strokeDashoffset={`calc(2 * 3.14159 * (50% - 4px) * ${(100 - progress) / 100})`}
          className="transition-all duration-150 ease-out"
        />
      </svg>

      {/* Audio Wave Bars - Show when recording */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-end gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${12 + Math.sin(Date.now() / 200 + i) * 8}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};