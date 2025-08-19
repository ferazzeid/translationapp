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
  holdToRecordMode?: boolean;
  holdProgress?: number;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
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
  isManagedMode = false,
  holdToRecordMode = false,
  holdProgress = 0,
  onHoldStart,
  onHoldEnd
}: SpeakerSectionProps) => {
  const showTurnIndicator = isManagedMode;
  const isActiveTurn = isManagedMode && isCurrentTurn;
  const isInactiveTurn = isManagedMode && !isCurrentTurn;

  return (
    <div className={cn(
      "h-full w-full relative overflow-hidden",
      isActiveTurn ? "" : "bg-background", // Only apply bg when not active turn
      isActiveTurn && "ring-2 ring-green-400/60",
      className
    )}>

      {/* Messages area - absolutely contained, can't push anything */}
      <div className="absolute inset-0 bottom-20 sm:bottom-24 overflow-hidden">
        <div className="h-full p-2 sm:p-4 overflow-y-auto flex flex-col-reverse">
          <div className="space-y-2 sm:space-y-3 min-h-0">
            {messages}
          </div>
        </div>
      </div>

      {/* Fixed microphone area - centered with ample padding */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-center z-30",
        isActiveTurn ? "bg-transparent" : "bg-background"
      )}>
        {/* Container for microphone - centered with padding for animations */}
        <div className="flex items-center justify-center p-8">
          {/* Main Microphone Button - Primary focal element */}
          <SpeakerButton
            speaker={speaker}
            isListening={isListening}
            onStart={onStart}
            onStop={onStop}
            language={language}
            flag={flag}
            isManagedMode={isManagedMode}
            isMyTurn={isCurrentTurn}
            holdToRecordMode={holdToRecordMode}
            holdProgress={holdProgress}
            onHoldStart={onHoldStart}
            onHoldEnd={onHoldEnd}
          />
        </div>
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