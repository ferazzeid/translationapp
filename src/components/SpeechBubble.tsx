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
  const [progress, setProgress] = useState(0);
  const [shouldRemove, setShouldRemove] = useState(false);

  // Calculate dynamic sizing based on text length
  const getInitialSize = () => {
    const textLength = text.length;
    if (textLength <= 10) return 1.2; // Very large for short text
    if (textLength <= 30) return 1.0; // Large for medium text
    if (textLength <= 60) return 0.85; // Medium for longer text
    return 0.7; // Smaller for very long text
  };

  const initialSize = getInitialSize();
  const lifespan = 8000; // 8 seconds total lifespan
  const centerReachTime = 0.7; // Reach center at 70% of lifespan

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / lifespan, 1);
      
      setProgress(newProgress);

      if (newProgress >= 1) {
        setShouldRemove(true);
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // Start animation after a brief delay
    const delay = index * 200; // Stagger bubbles
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [index, lifespan]);

  if (shouldRemove) return null;

  // Calculate position and scale based on progress
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
  const startX = speaker === "A" ? 20 : screenWidth - 20; // Start at edges
  const centerX = screenWidth / 2;
  const targetX = centerX + (speaker === "A" ? -60 : 60); // Stop before center with gap
  
  // Smooth movement from edge to center
  const currentX = startX + (targetX - startX) * Math.min(progress / centerReachTime, 1);
  
  // Dynamic scaling: start large, shrink as it moves to center
  const currentScale = initialSize * (1 - (progress * 0.6));
  
  // Opacity: fade out in final 30% of lifespan
  const currentOpacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
  
  // Vertical position with floating effect
  const baseY = 120 + (index * 60);
  const floatOffset = Math.sin(progress * Math.PI * 4) * 10; // Gentle floating
  const currentY = baseY + floatOffset;

  // Font size scales with bubble size
  const fontSize = currentScale > 0.9 ? 'text-lg' : currentScale > 0.8 ? 'text-base' : 'text-sm';

  return (
    <div
      className="absolute pointer-events-none transition-all duration-100 ease-linear"
      style={{
        left: `${currentX}px`,
        bottom: `${currentY}px`,
        transform: `translateX(-50%) scale(${currentScale})`,
        opacity: currentOpacity,
        zIndex: 50 - index
      }}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md border-2 min-w-max max-w-xs",
          speaker === "A" 
            ? "bg-primary/95 text-primary-foreground border-primary/30 shadow-primary/20" 
            : "bg-accent/95 text-accent-foreground border-accent/30 shadow-accent/20",
          fontSize,
          isOriginal ? "font-semibold" : "font-medium opacity-90"
        )}
      >
        <p className="break-words leading-tight">{text}</p>
        {!isOriginal && (
          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mt-1.5 mx-auto" />
        )}
      </div>
      
      {/* Enhanced speech bubble tail */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45",
          speaker === "A" 
            ? "-left-2 bg-primary/95 border-l border-b border-primary/30" 
            : "-right-2 bg-accent/95 border-r border-t border-accent/30"
        )}
      />
    </div>
  );
};