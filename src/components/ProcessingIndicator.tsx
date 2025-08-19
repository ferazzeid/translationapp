import { cn } from "@/lib/utils";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  speaker: "A" | "B";
}

export const ProcessingIndicator = ({ 
  isProcessing, 
  speaker 
}: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="bg-background/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-border">
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1s',
                  height: `${20 + Math.sin(Date.now() / 300 + i) * 12}px`
                }}
              />
            ))}
          </div>
          <span className="text-foreground font-medium">Processing...</span>
        </div>
      </div>
    </div>
  );
};