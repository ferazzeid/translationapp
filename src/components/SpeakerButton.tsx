import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  isMyTurn = true
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

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        {/* Enhanced pulsing circles for active speaker */}
        {isActiveInManagedMode && (
          <>
            <div className="absolute inset-0 rounded-full bg-black/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-110" />
            <div className="absolute inset-0 rounded-full bg-black/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] scale-125" />
            <div className="absolute inset-0 rounded-full bg-black/5 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] scale-140" />
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
              "bg-red-500 text-white border-2 border-red-400",
              "hover:bg-red-500", // Prevent hover changes when recording
              "scale-110" // Recording scale without strobe
            ] : isDisabled ? [
              "bg-gray-400 text-gray-200 border-2 border-gray-300",
              "cursor-not-allowed opacity-50"
            ] : isActiveInManagedMode ? [
              "bg-black text-white border-2 border-gray-700",
              "hover:bg-gray-900 hover:border-gray-600",
              "shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,0,0,0.6)]"
            ] : [
              "bg-black text-white border-2 border-gray-700",
              "hover:bg-gray-900 hover:border-gray-600",
              "shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,0,0,0.6)]"
            ]
          )}
          onClick={isDisabled ? undefined : (isListening ? onStop : onStart)}
        >
          {isListening ? (
            <Square className="h-8 w-8 fill-current relative z-10" />
          ) : (
            <Mic className="h-8 w-8 relative z-10" />
          )}
        </Button>
        
        {/* Language Code */}
        <div className="absolute -bottom-1 -right-1 bg-background border border-border rounded px-1.5 py-0.5 text-xs font-medium text-foreground">
          {getLanguageCode(language)}
        </div>
      </div>
    </div>
  );
};