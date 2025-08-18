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

  // Enhanced sizing system for better visual hierarchy
  const getInitialSize = () => {
    const textLength = text.length;
    if (textLength <= 15) return 2.0; // Very large for short text - fills most of screen
    if (textLength <= 40) return 1.6; // Large for medium text
    if (textLength <= 80) return 1.3; // Medium for longer text
    return 1.1; // Still substantial for very long text
  };

  const initialSize = getInitialSize();
  const lifespan = 10000; // 10 seconds total lifespan for better readability
  const shrinkPhases = {
    initial: 0.3,    // 30% - big and prominent
    medium: 0.6,     // 60% - medium size, moving to position
    final: 1.0       // 100% - small, in conversation position
  };

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

  // Enhanced positioning and animation system
  const appWidth = 390;
  const appHeight = 800;
  
  // Three-phase movement: center → edge → conversation position
  let currentX: number, currentY: number, currentScale: number;
  
  if (progress <= shrinkPhases.initial) {
    // Phase 1: Large bubble in center of screen
    const phaseProgress = progress / shrinkPhases.initial;
    currentX = appWidth / 2;
    currentY = appHeight / 2 + 100; // Center with slight offset
    currentScale = initialSize * (1 - phaseProgress * 0.2); // Slight shrink
  } else if (progress <= shrinkPhases.medium) {
    // Phase 2: Medium bubble moving to conversation area
    const phaseProgress = (progress - shrinkPhases.initial) / (shrinkPhases.medium - shrinkPhases.initial);
    const targetX = speaker === "A" ? appWidth * 0.25 : appWidth * 0.75;
    const targetY = 200 + (index * 60);
    
    currentX = (appWidth / 2) + (targetX - appWidth / 2) * phaseProgress;
    currentY = (appHeight / 2 + 100) + (targetY - (appHeight / 2 + 100)) * phaseProgress;
    currentScale = initialSize * 0.8 * (1 - phaseProgress * 0.4); // Shrink to medium
  } else {
    // Phase 3: Small bubble in conversation position
    const phaseProgress = (progress - shrinkPhases.medium) / (shrinkPhases.final - shrinkPhases.medium);
    const finalX = speaker === "A" ? appWidth * 0.25 : appWidth * 0.75;
    const finalY = 200 + (index * 60);
    
    currentX = finalX;
    currentY = Math.min(finalY, appHeight - 100);
    currentScale = initialSize * 0.48 * (1 - phaseProgress * 0.1); // Final small size
  }
  
  // Enhanced fade out - more graceful
  const currentOpacity = progress > 0.85 ? 1 - ((progress - 0.85) / 0.15) : 1;

  // Font size 
  const fontSize = 'text-base';

  return (
    <div
      className="absolute pointer-events-none z-50"
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