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
  totalMessages = 1
}: SpeechBubbleProps) => {
  // Simpler, more reliable sizing
  const getDynamicSizing = () => {
    // Use consistent width that doesn't cause layout issues
    const widthPercent = 85;
    
    // Use consistent font size that's readable
    const fontSize = "text-sm";
    
    return { widthPercent, fontSize };
  };

  const { widthPercent, fontSize } = getDynamicSizing();
  const isLeftAligned = speaker === "A";
  
  return (
    <div className={cn(
      "w-full flex mb-2",
      isLeftAligned ? "justify-start" : "justify-end"
    )}>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-sm transition-all duration-300",
          isDarkMode 
            ? "bg-foreground text-background border border-border/20" 
            : "bg-background text-foreground border border-border",
          isNew && "animate-fade-in-up",
          fontSize
        )}
        style={{ width: `${widthPercent}%` }}
      >
        <p className="leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  );
};