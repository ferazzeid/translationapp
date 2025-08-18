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
    const isNewest = index === 0;
    const messageAge = index; // 0 = newest, higher = older
    
    // Calculate dynamic width (full width for newest, then scale down)
    let widthPercent;
    if (totalMessages <= 2) {
      widthPercent = isNewest ? 95 : 85; // Use almost full width when few messages
    } else {
      widthPercent = Math.max(60, 95 - (messageAge * 8)); // Scale down as messages get older
    }
    
    // Calculate dynamic font size
    let fontSize;
    if (isNewest && totalMessages <= 3) {
      fontSize = "text-lg"; // Large for newest when space available
    } else if (messageAge <= 1) {
      fontSize = "text-base"; // Medium for recent messages
    } else {
      fontSize = "text-sm"; // Small for older messages
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