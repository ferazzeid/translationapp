import { cn } from "@/lib/utils";

interface CentralLoadingAnimationProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  className?: string;
}

// Animated processing dots
const ProcessingDots = () => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-current animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Animated waveform bars for recording
const RecordingWave = () => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-sm"
          style={{
            height: `${12 + Math.sin(Date.now() / 300 + i) * 8}px`,
            animation: `pulse 0.8s ease-in-out infinite ${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export const CentralLoadingAnimation = ({ 
  isProcessing = false,
  isRecording = false,
  className 
}: CentralLoadingAnimationProps) => {
  const isActive = isProcessing || isRecording;
  
  if (!isActive) return null;

  return (
    <div className={cn(
      "flex items-center justify-center text-2xl theme-primary animate-fade-in",
      className
    )}>
      {isRecording ? <RecordingWave /> : <ProcessingDots />}
    </div>
  );
};