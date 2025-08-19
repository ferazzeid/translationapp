import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakerButton } from "./SpeakerButton";
import { MessageArea } from "./MessageArea";

interface SpeakerSectionProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
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
      "h-full w-full relative bg-background overflow-hidden transition-all duration-300",
      isActiveTurn && "ring-2 ring-primary bg-primary/5",
      isInactiveTurn && "opacity-60 bg-muted/20",
      className
    )}>
      {/* Turn Indicator */}
      {showTurnIndicator && (
        <div className={cn(
          "absolute top-2 left-2 right-2 z-20 text-center text-xs font-medium py-1 px-2 rounded-md transition-all duration-300",
          isActiveTurn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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

      {/* Fixed microphone button - completely independent */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-center bg-background z-30 border-t border-border">
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