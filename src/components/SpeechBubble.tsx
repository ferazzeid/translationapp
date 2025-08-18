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

  // Simplified positioning for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Simple positioning: start from speaker's side and move toward center
  const startX = speaker === "A" ? 40 : screenWidth - 40;
  const centerX = screenWidth / 2;
  const targetX = speaker === "A" ? centerX - 80 : centerX + 80;
  
  // Simple linear movement
  const moveProgress = Math.min(progress / 0.6, 1); // Reach position in first 60% of lifespan
  const currentX = startX + (targetX - startX) * moveProgress;
  
  // Simple scaling
  const currentScale = Math.max(0.7, 1 - (progress * 0.3));
  
  // Fade out in final 20%
  const currentOpacity = progress > 0.8 ? 1 - ((progress - 0.8) / 0.2) : 1;
  
  // Simple vertical positioning
  const baseY = isMobile ? 100 + (index * 80) : 120 + (index * 60);
  const currentY = baseY;

  // Font size 
  const fontSize = 'text-base';

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${currentX}px`,
        bottom: `${currentY}px`,
        transform: `translateX(-50%) scale(${currentScale})`,
        opacity: currentOpacity,
      }}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-xl border-2 max-w-xs",
          speaker === "A" 
            ? "bg-blue-500 text-white border-blue-400" 
            : "bg-green-500 text-white border-green-400",
          fontSize,
          isOriginal ? "font-semibold" : "font-medium"
        )}
      >
        <p className="break-words leading-tight whitespace-pre-wrap">{text}</p>
        {!isOriginal && (
          <div className="w-2 h-2 rounded-full bg-white/60 mt-2 mx-auto" />
        )}
      </div>
      
      {/* Speech bubble tail */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45",
          speaker === "A" 
            ? "-left-1 bg-blue-500 border-l border-b border-blue-400" 
            : "-right-1 bg-green-500 border-r border-t border-green-400"
        )}
      />
    </div>
  );
};