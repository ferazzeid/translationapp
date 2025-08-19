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
    <div className={cn("absolute inset-0 rounded-full pointer-events-none recording-indicator", className)}>
      {/* Progress Ring - Show when progress > 0 */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 transition-opacity duration-200"
        style={{ opacity: progress > 0 ? 1 : 0 }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />
        <circle
          cx="50%"
          cy="50%"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 36}`}
          strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
          className="transition-all duration-150 ease-out"
        />
      </svg>

      {/* Audio Wave Bars - Show when recording */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-end gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full animate-pulse recording-indicator"
              style={{
                height: `${12 + Math.sin(Date.now() / 200 + i) * 8}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '1s',
                backgroundColor: 'currentColor'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};