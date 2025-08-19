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
      isActiveTurn ? "" : "theme-surface", // Only apply bg when not active turn
      isActiveTurn && "ring-2 ring-green-500/60",
      className
    )}>

      {/* Messages area with language indicator */}
      <div className="absolute inset-0 bottom-20 sm:bottom-24 overflow-hidden">
        {/* Language Indicator - 20px margin from left */}
        <div className="absolute top-2 left-5 z-40 theme-language-chip backdrop-blur-sm border theme-divider rounded px-2 py-1">
          <span className="text-xs font-medium theme-text">
            {flag} {language.toUpperCase()}
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
        isActiveTurn ? "bg-transparent" : "theme-surface"
      )}>
        {/* Left side: Repeat button with 20px margin */}
        <div className="absolute left-5 bottom-6 flex items-center">
          <button
            onClick={onRepeat}
            className="min-h-[44px] min-w-[44px] h-10 w-10 rounded-full theme-button flex items-center justify-center transition-colors shadow-sm"
            title="Repeat last message"
          >
            <svg 
              className="h-4 w-4" 
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
          "absolute inset-0 animate-pulse pointer-events-none z-10",
          speaker === "A" ? "bg-speaker-a/5" : "bg-speaker-b/5"
        )} />
      )}
    </div>
  );
};