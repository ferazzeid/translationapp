import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakerButton } from "./SpeakerButton";
import { MessageArea } from "./MessageArea";

interface SpeakerSectionProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onRepeat: () => void;
  language: string;
  flag: string;
  messages: ReactNode;
  isTop?: boolean;
  className?: string;
  isCurrentTurn?: boolean;
  isManagedMode?: boolean;
}

export const SpeakerSection = ({
  speaker,
  isListening,
  onStart,
  onStop,
  onRepeat,
  language,
  flag,
  messages,
  isTop = false,
  className,
  isCurrentTurn = false,
  isManagedMode = false
}: SpeakerSectionProps) => {
  const showTurnIndicator = isManagedMode;
  const isActiveTurn = isManagedMode && isCurrentTurn;
  const isInactiveTurn = isManagedMode && !isCurrentTurn;

  return (
    <div className={cn(
      "h-full w-full relative bg-background overflow-hidden",
      isActiveTurn && "ring-1 ring-primary/30",
      isInactiveTurn && "opacity-70",
      className
    )}>
      {/* Turn Indicator */}
      {showTurnIndicator && (
        <div className={cn(
          "absolute top-2 left-2 right-2 z-20 text-center text-xs font-medium py-1 px-2 rounded-md",
          isActiveTurn ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground"
        )}>
          {isActiveTurn ? `Speaker ${speaker} - Your Turn` : `Speaker ${speaker} - Waiting`}
        </div>
      )}

      {/* Messages area - absolutely contained, can't push anything */}
      <div className={cn(
        "absolute inset-0 bottom-20 sm:bottom-24 overflow-hidden",
        showTurnIndicator && "top-8"
      )}>
        <div className="h-full p-2 sm:p-4 overflow-y-auto flex flex-col-reverse">
          <div className="space-y-2 sm:space-y-3 min-h-0">
            {messages}
          </div>
        </div>
      </div>

      {/* Fixed microphone and repeat button area */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-center bg-background z-30 border-t border-border">
        {/* Repeat Button - Left side */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={onRepeat}
            className="h-12 w-12 rounded-full bg-muted hover:bg-muted/80 border border-border shadow-sm flex items-center justify-center transition-colors"
            title="Repeat last message"
          >
            <svg 
              className="h-5 w-5 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>

        {/* Main Microphone Button - Center */}
        <SpeakerButton
          speaker={speaker}
          isListening={isListening}
          onStart={onStart}
          onStop={onStop}
          language={language}
          flag={flag}
        />
      </div>

      {/* Listening feedback overlay */}
      {isListening && (
        <div className={cn(
          "absolute inset-0 animate-pulse pointer-events-none z-10",
          speaker === "A" ? "bg-speaker-a/5" : "bg-speaker-b/5"
        )} />
      )}
    </div>
  );
};