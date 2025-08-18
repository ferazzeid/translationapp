import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRemove, setShouldRemove] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto-remove after 10 seconds for older messages
    if (index > 0) {
      const removeTimer = setTimeout(() => {
        setShouldRemove(true);
      }, 10000 - (index * 2000));
      
      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [index]);

  if (shouldRemove) return null;

  const scale = index === 0 ? 1 : Math.max(0.7, 1 - (index * 0.15));
  const opacity = index === 0 ? 1 : Math.max(0.4, 1 - (index * 0.2));

  return (
    <div
      className={cn(
        "absolute transition-all duration-500 ease-out pointer-events-none",
        speaker === "A" ? "left-4" : "right-4",
        !isVisible && "opacity-0 translate-y-4",
        isVisible && "opacity-100 translate-y-0",
        isNew && "animate-fade-in-up"
      )}
      style={{
        bottom: `${120 + (index * 80)}px`,
        transform: `scale(${scale})`,
        opacity: opacity,
        zIndex: 10 - index
      }}
    >
      <div
        className={cn(
          "max-w-xs rounded-2xl px-4 py-3 shadow-medium backdrop-blur-sm border",
          speaker === "A" 
            ? "bg-primary/90 text-primary-foreground border-primary/20" 
            : "bg-accent/90 text-accent-foreground border-accent/20",
          isOriginal ? "text-sm font-medium" : "text-xs opacity-80"
        )}
      >
        <p className="break-words">{text}</p>
        {!isOriginal && (
          <div className="w-2 h-2 rounded-full bg-current opacity-50 mt-1" />
        )}
      </div>
      
      {/* Speech bubble tail */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45",
          speaker === "A" 
            ? "-left-1.5 bg-primary/90 border-l border-b border-primary/20" 
            : "-right-1.5 bg-accent/90 border-r border-t border-accent/20"
        )}
      />
    </div>
  );
};