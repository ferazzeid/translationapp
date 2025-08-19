import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HoldToRecordIndicator } from "./HoldToRecordIndicator";
import { useRef, useCallback } from "react";

interface SpeakerButtonProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  language: string;
  flag: string;
  className?: string;
  isManagedMode?: boolean;
  isMyTurn?: boolean;
  holdToRecordMode?: boolean;
  holdProgress?: number;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
}

export const SpeakerButton = ({
  speaker,
  isListening,
  onStart,
  onStop,
  language,
  flag,
  className,
  isManagedMode = false,
  isMyTurn = true,
  holdToRecordMode = false,
  holdProgress = 0,
  onHoldStart,
  onHoldEnd
}: SpeakerButtonProps) => {
  const getLanguageCode = (language: string): string => {
    const languageCodes: { [key: string]: string } = {
      'en': 'EN',
      'es': 'ES', 
      'fr': 'FR',
      'de': 'DE',
      'it': 'IT',
      'pt': 'PT',
      'ru': 'RU',
      'ja': 'JA',
      'ko': 'KO',
      'zh': 'ZH',
      'ar': 'AR',
      'hi': 'HI',
      'tr': 'TR',
      'pl': 'PL',
      'nl': 'NL',
      'sv': 'SV',
      'da': 'DA',
      'no': 'NO',
      'fi': 'FI',
      'hu': 'HU',
      'cs': 'CS',
      'sk': 'SK',
      'sl': 'SL',
      'hr': 'HR',
      'sr': 'SR',
      'bg': 'BG',
      'ro': 'RO',
      'uk': 'UK',
      'el': 'EL',
      'he': 'HE',
      'th': 'TH',
      'vi': 'VI',
      'id': 'ID',
      'ms': 'MS',
      'tl': 'TL'
    };
    return languageCodes[language] || language.toUpperCase().slice(0, 2);
  };

  const isDisabled = isManagedMode && !isMyTurn && !isListening;
  const isActiveInManagedMode = isManagedMode && isMyTurn && !isListening;
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hold-to-record handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isDisabled || !holdToRecordMode) return;
    e.preventDefault();
    onHoldStart?.();
  }, [isDisabled, holdToRecordMode, onHoldStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDisabled || !holdToRecordMode) return;
    e.preventDefault();
    onHoldEnd?.();
  }, [isDisabled, holdToRecordMode, onHoldEnd]);

  const handleClick = useCallback(() => {
    if (isDisabled || holdToRecordMode) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  }, [isDisabled, holdToRecordMode, isListening, onStart, onStop]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        {/* Enhanced pulsing circles for active speaker */}
        {isActiveInManagedMode && (
          <>
            <div className="absolute inset-0 rounded-full bg-[hsl(var(--theme-primary)/0.3)] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-110" />
            <div className="absolute inset-0 rounded-full bg-[hsl(var(--theme-primary)/0.2)] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] scale-125" />
            <div className="absolute inset-0 rounded-full bg-[hsl(var(--theme-primary)/0.1)] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-140" />
          </>
        )}
        
        <Button
          size="lg"
          variant="ghost"
          disabled={isDisabled}
          className={cn(
            "min-h-[44px] min-w-[44px] h-20 w-20 rounded-full transition-all duration-300 relative overflow-hidden",
            !isDisabled && "hover:scale-105",
            isListening ? [
              "mic",
              "hover:bg-[hsl(var(--theme-mic-bg))]",
              "scale-110"
            ] : isDisabled ? [
              "mic--inactive border-2 theme-border",
              "cursor-not-allowed opacity-50"
            ] : isActiveInManagedMode ? [
              "mic border-2",
              "hover:opacity-90"
            ] : [
              "mic--inactive hover:theme-mic-inactive-hover border-2 theme-border"
            ]
          )}
          onClick={holdToRecordMode ? undefined : handleClick}
          onPointerDown={holdToRecordMode ? handlePointerDown : undefined}
          onPointerUp={holdToRecordMode ? handlePointerUp : undefined}
          onPointerLeave={holdToRecordMode ? handlePointerUp : undefined}
        >
          {isListening ? (
            <Square className="h-8 w-8 fill-current relative z-10 icon" />
          ) : (
            <Mic className={cn(
              "h-8 w-8 relative z-10 icon",
              isDisabled ? "theme-icon-disabled" : isActiveInManagedMode ? "theme-icon-active" : "theme-icon theme-icon-hover"
            )} />
          )}
          
          {/* Hold to Record Progress Indicator */}
          {holdToRecordMode && (
            <HoldToRecordIndicator
              progress={holdProgress}
              isRecording={isListening}
              className="z-20"
            />
          )}
        </Button>
      </div>
    </div>
  );
};