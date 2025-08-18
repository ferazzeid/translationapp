import { Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  message?: string;
  speaker: "A" | "B";
}

export const ProcessingIndicator = ({ 
  isProcessing, 
  message = "Thinking...", 
  speaker 
}: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 p-3 mx-4 my-2 rounded-lg border border-border bg-background/50",
      speaker === "A" ? "flex-row-reverse" : "flex-row"
    )}>
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{message}</span>
      <Brain className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};