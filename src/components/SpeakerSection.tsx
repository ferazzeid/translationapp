import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakerButton } from "./SpeakerButton";
import { MessageArea } from "./MessageArea";
import { RecordingCountdown } from "./RecordingCountdown";

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
  recordingDuration?: number;
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
  onHoldEnd,
  recordingDuration = 0
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
      <div className="absolute inset-0 bottom-28 sm:bottom-32 overflow-hidden">
        {/* Language Indicator - smaller and positioned right */}
        <div className="absolute top-2 right-3 z-40 theme-language-chip backdrop-blur-sm border theme-divider rounded px-1.5 py-0.5 text-center min-w-[32px]">
          <span className="text-xs font-medium theme-icon leading-none block">
            {flag}
          </span>
        </div>
        
        <div className="h-full p-2 sm:p-4 pt-12 pr-12 overflow-y-auto flex flex-col-reverse">
          <div className="space-y-2 sm:space-y-3 min-h-0">
            {messages}
          </div>
        </div>
      </div>

      {/* Fixed microphone and control area */}
      <div className={cn(
        "absolute bottom-4 left-0 right-0 h-20 sm:h-24 flex items-center justify-center z-30",
        isActiveTurn ? "theme-speaker-active-bg" : "theme-speaker-inactive-bg"
      )}>
        {/* Center: Main Microphone Button - Perfectly centered */}
        <div className="flex items-center justify-center relative">
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
          
          {/* Recording countdown */}
          {isListening && recordingDuration > 0 && (
            <RecordingCountdown 
              duration={recordingDuration}
              maxDuration={60000}
            />
          )}
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