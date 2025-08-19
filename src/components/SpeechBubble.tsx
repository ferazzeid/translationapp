import { cn } from "@/lib/utils";

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
          "text-base", // Consistent readable font size
          isLeftAligned ? "bubble--theirs" : "bubble--mine"
        )}
      >
        <p className="leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  );
};