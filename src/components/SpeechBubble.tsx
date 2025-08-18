import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  text: string;
  isOriginal?: boolean;
  index: number;
  speaker: "A" | "B";
  isNew?: boolean;
}

export const SpeechBubble = ({ 
  text, 
  isOriginal = true, 
  index, 
  speaker,
  isNew = false 
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
          isLeftAligned 
            ? "bg-speaker-a text-primary-foreground rounded-bl-sm" 
            : "bg-speaker-b text-accent-foreground rounded-br-sm",
          isNew && "animate-fade-in-up"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
        {!isOriginal && (
          <div className={cn(
            "w-2 h-2 rounded-full mt-2",
            isLeftAligned ? "bg-primary-foreground/60" : "bg-accent-foreground/60"
          )} />
        )}
      </div>
    </div>
  );
};