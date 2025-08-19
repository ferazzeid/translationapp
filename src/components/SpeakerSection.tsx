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
      isActiveTurn ? "theme-speaker-active-bg" : "theme-speaker-inactive-bg",
      isActiveTurn && "ring-2 theme-active-ring",
      className
    )}>

      {/* Messages area with language indicator */}
      <div className="absolute inset-0 bottom-20 sm:bottom-24 overflow-hidden">
        {/* Language Indicator - 20px margin from left */}
        <div className="absolute top-2 left-5 z-40 theme-language-chip backdrop-blur-sm border theme-divider rounded px-2 py-1">
          <span className="text-xs font-medium theme-text">
            {flag}
          </span>
        </div>
        
        <div className="h-full p-2 sm:p-4 pt-12 overflow-y-auto flex flex-col-reverse">
          <div className="space-y-2 sm:space-y-3 min-h-0">
            {messages}
          </div>
        </div>
      </div>

      {/* Fixed microphone and control area */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-20 sm:h-24 flex items-center justify-center z-30",
        isActiveTurn ? "theme-speaker-active-bg" : "theme-speaker-inactive-bg"
      )}>
        {/* Center: Main Microphone Button - Perfectly centered */}
        <div className="flex items-center justify-center">
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
          "absolute inset-0 animate-pulse pointer-events-none z-10 theme-speaker-listening-overlay"
        )} />
      )}
    </div>
  );
};