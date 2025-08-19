import { cn } from "@/lib/utils";

interface ProcessingIndicatorProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  speaker: "A" | "B";
  type?: "recording" | "processing";
}

export const ProcessingIndicator = ({ 
  isProcessing = false,
  isRecording = false,
  speaker,
  type = "processing"
}: ProcessingIndicatorProps) => {
  const isVisible = isProcessing || isRecording;
  if (!isVisible) return null;

  const isRecordingState = type === "recording" || isRecording;
  const barColor = isRecordingState ? "bg-red-500" : "bg-blue-500";
  const text = isRecordingState ? "Recording..." : "Processing...";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          {/* Animated bars */}
          <div className="flex items-end gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full animate-pulse",
                  barColor
                )}
                style={{
                  height: `${12 + (i % 2) * 6}px`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
          <span className="text-gray-700 text-sm font-medium">{text}</span>
        </div>
      </div>
    </div>
  );
};