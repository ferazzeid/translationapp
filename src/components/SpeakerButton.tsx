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
}

export const SpeakerButton = ({
  speaker,
  isListening,
  onStart,
  onStop,
  language,
  flag,
  className
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

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <Button
          size="lg"
          variant="ghost"
          className={cn(
            "h-20 w-20 rounded-full transition-all duration-300",
            "hover:scale-105",
            isListening ? [
              "bg-destructive text-destructive-foreground border-0",
              "hover:bg-destructive", // Prevent hover changes when recording
              "recording-pulse" // Use our custom slow pulse animation
            ] : [
              "bg-foreground text-background hover:bg-foreground/80 border border-border"
            ]
          )}
          onClick={isListening ? onStop : onStart}
        >
          {isListening ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-8 w-8" />
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