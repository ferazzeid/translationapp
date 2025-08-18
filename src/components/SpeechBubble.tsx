import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  text: string;
  isOriginal?: boolean;
  index: number;
  speaker: "A" | "B";
  isNew?: boolean;
  isDarkMode?: boolean;
  totalMessages?: number;
}

export const SpeechBubble = ({ 
  text, 
  isOriginal = true, 
  index, 
  speaker,
  isNew = false,
  isDarkMode = false,
}: SpeechBubbleProps) => {
  const isLeftAligned = speaker === "A";
  
  return (
    <div className={cn(
      "w-full flex",
      isLeftAligned ? "justify-start" : "justify-end",
      isNew && "animate-fade-in"
    )}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border",
          isDarkMode 
            ? "bg-foreground text-background border-border/20" 
            : "bg-background text-foreground border-border",
          "text-base" // Consistent readable font size
        )}
      >
        <p className="leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  );
};