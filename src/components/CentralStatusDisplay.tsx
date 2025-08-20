import { cn } from "@/lib/utils";

interface CentralStatusDisplayProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  currentStep?: string;
  speaker?: "A" | "B";
  className?: string;
}

// Animated processing dots
const ProcessingDots = () => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
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
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-sm"
          style={{
            height: `${8 + Math.sin(Date.now() / 300 + i) * 6}px`,
            animation: `pulse 0.8s ease-in-out infinite ${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export const CentralStatusDisplay = ({ 
  isProcessing = false,
  isRecording = false,
  currentStep,
  speaker,
  className 
}: CentralStatusDisplayProps) => {
  const isActive = isProcessing || isRecording;
  
  if (!isActive) return null;

  const getStatusText = () => {
    if (isRecording && speaker) {
      return `Listening to Speaker ${speaker}...`;
    }
    if (currentStep) {
      return currentStep;
    }
    if (isProcessing) {
      return "Processing...";
    }
    return "";
  };

  const getDetailedStatusText = () => {
    if (isRecording && speaker) {
      return `Listening to Speaker ${speaker}...`;
    }
    
    // Enhanced progress states for better user feedback
    switch (currentStep) {
      case 'speech-to-text':
        return "Transcribing...";
      case 'parallel-translation-tts':
        return "Translating...";
      case 'text-to-speech':
        return "Generating voice...";
      case 'pipeline-start':
        return "Processing...";
      default:
        return currentStep || (isProcessing ? "Processing..." : "");
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm theme-text opacity-75",
      className
    )}>
      {isRecording ? <RecordingWave /> : <ProcessingDots />}
      <span className="font-medium">
        {getDetailedStatusText()}
      </span>
    </div>
  );
};