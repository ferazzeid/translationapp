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
  // Dynamic sizing based on position and available space
  const getDynamicSizing = () => {
    const messageAge = index; // 0 = newest, higher = older
    
    // Calculate dynamic width (more conservative scaling)
    let widthPercent;
    if (totalMessages <= 2) {
      widthPercent = messageAge === 0 ? 90 : 80; // Use most width when few messages
    } else {
      widthPercent = Math.max(70, 90 - (messageAge * 5)); // Gentler scale down
    }
    
    // Calculate dynamic font size (more conservative)
    let fontSize;
    if (messageAge === 0 && totalMessages <= 2) {
      fontSize = "text-base"; // Slightly larger for newest when space available
    } else {
      fontSize = "text-sm"; // Standard size for others
    }
    
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