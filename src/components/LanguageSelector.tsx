import { useState } from "react";
import { ChevronDown, Languages, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
];

interface LanguageSelectorProps {
  selectedLanguages: { speakerA: string; speakerB: string };
  onLanguageChange: (speaker: "speakerA" | "speakerB", language: string) => void;
  onContinue: () => void;
  onOpenSettings?: () => void;
}

export const LanguageSelector = ({ 
  selectedLanguages, 
  onLanguageChange, 
  onContinue,
  onOpenSettings
}: LanguageSelectorProps) => {
  const [expandedSelector, setExpandedSelector] = useState<"speakerA" | "speakerB" | null>(null);

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || "Select Language";
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || "🌐";
  };

  const isReady = selectedLanguages.speakerA && selectedLanguages.speakerB;

  return (
    <div className="h-full flex flex-col bg-gradient-surface">
      {/* Header with settings */}
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm border-b border-border/50">
        <h1 className="text-lg font-bold text-foreground">Setup</h1>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 w-8 p-0"
          >
            <Settings size={16} />
          </Button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
            <Languages size={24} className="text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Select languages for your conversation</p>
        </div>

        <div className="space-y-3">
          {/* Speaker A Language */}
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-speaker-a"></div>
              <span className="font-medium text-sm text-foreground">Your Language</span>
            </div>
            
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-10 text-left",
                expandedSelector === "speakerA" && "ring-2 ring-primary"
              )}
              onClick={() => setExpandedSelector(expandedSelector === "speakerA" ? null : "speakerA")}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLanguageFlag(selectedLanguages.speakerA)}</span>
                <span className="text-sm font-medium">{getLanguageName(selectedLanguages.speakerA)}</span>
              </div>
              <ChevronDown size={16} className={cn(
                "transition-transform",
                expandedSelector === "speakerA" && "rotate-180"
              )} />
            </Button>

            {expandedSelector === "speakerA" && (
              <div className="grid grid-cols-1 gap-1 mt-2 animate-fade-in-up max-h-40 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="h-8 justify-start text-sm"
                    onClick={() => {
                      onLanguageChange("speakerA", lang.code);
                      setExpandedSelector(null);
                    }}
                  >
                    <span className="text-base mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </Card>

          {/* Speaker B Language */}
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-speaker-b"></div>
              <span className="font-medium text-sm text-foreground">Other Person's Language</span>
            </div>
            
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-10 text-left",
                expandedSelector === "speakerB" && "ring-2 ring-primary"
              )}
              onClick={() => setExpandedSelector(expandedSelector === "speakerB" ? null : "speakerB")}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLanguageFlag(selectedLanguages.speakerB)}</span>
                <span className="text-sm font-medium">{getLanguageName(selectedLanguages.speakerB)}</span>
              </div>
              <ChevronDown size={16} className={cn(
                "transition-transform",
                expandedSelector === "speakerB" && "rotate-180"
              )} />
            </Button>

            {expandedSelector === "speakerB" && (
              <div className="grid grid-cols-1 gap-1 mt-2 animate-fade-in-up max-h-40 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="h-8 justify-start text-sm"
                    onClick={() => {
                      onLanguageChange("speakerB", lang.code);
                      setExpandedSelector(null);
                    }}
                  >
                    <span className="text-base mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-border/50">
        <Button
          className="w-full h-10 bg-gradient-primary shadow-medium flex items-center justify-center gap-2"
          disabled={!isReady}
          onClick={onContinue}
        >
          Start Conversation
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};