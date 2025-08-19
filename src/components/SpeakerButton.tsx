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
            <div className="absolute inset-0 rounded-full bg-gray-400/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-110" />
            <div className="absolute inset-0 rounded-full bg-gray-400/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] scale-125" />
            <div className="absolute inset-0 rounded-full bg-gray-400/5 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-140" />
          </>
        )}
        
        <Button
          size="lg"
          variant="ghost"
          disabled={isDisabled}
          className={cn(
            "h-20 w-20 rounded-full transition-all duration-300 relative overflow-hidden",
            !isDisabled && "hover:scale-105",
            isListening ? [
              "theme-mic theme-mic-glow",
              "hover:bg-[hsl(var(--theme-mic-bg))]", // Prevent hover changes when recording
              "scale-110" // Recording scale without strobe
            ] : isDisabled ? [
              "bg-gray-400 text-gray-200 border-2 border-gray-300",
              "cursor-not-allowed opacity-50"
            ] : isActiveInManagedMode ? [
              "theme-mic border-2 border-[hsl(var(--theme-mic-bg))]",
              "hover:opacity-90",
              "shadow-[0_0_20px_hsl(var(--theme-mic-bg)/0.4)] hover:shadow-[0_0_25px_hsl(var(--theme-mic-bg)/0.6)]"
            ] : [
              "theme-button border-2",
              "shadow-[0_0_20px_hsl(var(--theme-border)/0.3)] hover:shadow-[0_0_25px_hsl(var(--theme-border)/0.5)]"
            ]
          )}
          onClick={holdToRecordMode ? undefined : handleClick}
          onPointerDown={holdToRecordMode ? handlePointerDown : undefined}
          onPointerUp={holdToRecordMode ? handlePointerUp : undefined}
          onPointerLeave={holdToRecordMode ? handlePointerUp : undefined}
        >
          {isListening ? (
            <Square className="h-8 w-8 fill-current relative z-10" />
          ) : (
            <Mic className="h-8 w-8 relative z-10" />
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