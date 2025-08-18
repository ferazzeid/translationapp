import { Brain } from "lucide-react";
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
    <div className={cn(
      "flex items-center justify-center py-4",
      speaker === "A" ? "justify-start" : "justify-end"
    )}>
      <Brain className="h-6 w-6 text-muted-foreground animate-pulse" />
    </div>
  );
};