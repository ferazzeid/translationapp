import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  text: string;
  isOriginal?: boolean;
  index: number;
  speaker: "A" | "B";
  isNew?: boolean;
  isDarkMode?: boolean;
}

export const SpeechBubble = ({ 
  text, 
  isOriginal = true, 
  index, 
  speaker,
  isNew = false,
  isDarkMode = false
}: SpeechBubbleProps) => {
  // Simple chat bubble positioning
  const isLeftAligned = speaker === "A";
  
  return (
    <div className={cn(
      "w-full flex mb-3 px-4",
      isLeftAligned ? "justify-start" : "justify-end"
    )}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isDarkMode 
            ? "bg-foreground text-background border border-border/20" 
            : "bg-background text-foreground border border-border",
          isNew && "animate-fade-in-up"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  );
};