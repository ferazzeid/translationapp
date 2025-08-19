import { cn } from "@/lib/utils";

interface ProcessingIndicatorProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  speaker: "A" | "B";
  type?: "recording" | "processing";
}

// Animated waveform bars component
const WaveformBars = () => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-red-500 rounded-sm animate-pulse"
          style={{
            height: `${8 + Math.random() * 16}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};

export const ProcessingIndicator = ({ 
  isProcessing = false,
  isRecording = false,
  speaker,
  type = "processing"
}: ProcessingIndicatorProps) => {
  const isActive = isProcessing || isRecording;
  
  if (!isActive) return null;

  // Position based on speaker
  const isBottomHalf = speaker === "A";
  
  return (
    <div 
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none",
        isBottomHalf 
          ? "top-1/2 translate-y-4" // 16px below central divider
          : "top-1/2 -translate-y-10" // 16px above central divider
      )}
    >
      <div className="h-6 flex items-center">
        <WaveformBars />
      </div>
    </div>
  );
};