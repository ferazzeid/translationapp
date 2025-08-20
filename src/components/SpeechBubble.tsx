import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpeechBubbleProps {
  text: string;
  isOriginal?: boolean;
  index: number;
  speaker: "A" | "B";
  isNew?: boolean;
  totalMessages?: number;
}

export const SpeechBubble = ({ 
  text, 
  isOriginal = true, 
  index, 
  speaker,
  isNew = false
}: SpeechBubbleProps) => {
  const isLeftAligned = speaker === "A";
  const isMostRecent = index === 0;
  
  // Dynamic font sizing based on text length and recency
  const getTextSize = () => {
    if (!isMostRecent) return "text-base";
    
    const textLength = text.length;
    if (textLength > 300) return "text-sm";
    if (textLength > 150) return "text-lg";
    return "text-2xl";
  };
  
  const textSizeClass = getTextSize();
  
  return (
    <div className={cn(
      "w-full flex",
      isLeftAligned ? "justify-start" : "justify-end",
      isNew && "animate-fade-in"
    )}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border",
          "theme-surface theme-text theme-border",
          textSizeClass,
          isLeftAligned ? "bubble--theirs" : "bubble--mine"
        )}
      >
        {text.length > 150 ? (
          <ScrollArea className="max-h-40 w-full">
            <p className="leading-relaxed whitespace-pre-wrap break-words pr-4">
              {text}
            </p>
          </ScrollArea>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};