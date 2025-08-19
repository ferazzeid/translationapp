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
  { code: "en", name: "English", flag: "EN" },
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
  showAsSettings?: boolean;
  onSignOut?: () => void;
}

export const LanguageSelector = ({ 
  selectedLanguages, 
  onLanguageChange, 
  onContinue,
  onOpenSettings,
  showAsSettings = false,
  onSignOut
}: LanguageSelectorProps) => {
  const [expandedSelector, setExpandedSelector] = useState<"speakerA" | "speakerB" | null>(null);

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || "Select Language";
  };

  const isReady = selectedLanguages.speakerA && selectedLanguages.speakerB;

  return (
    <div className="h-full flex flex-col theme-bg">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium theme-text mb-8">Select your language pair</h1>
        </div>

        <div className="space-y-6">
          {/* Other Person's Language - TOP */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium theme-text">Other person speaks</h2>
            
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-12 text-left theme-button border-2 theme-border hover:theme-surface-alt",
                expandedSelector === "speakerB" && "theme-surface-alt"
              )}
              onClick={() => setExpandedSelector(expandedSelector === "speakerB" ? null : "speakerB")}
            >
              <span className="text-base font-medium theme-text">{getLanguageName(selectedLanguages.speakerB)}</span>
              <ChevronDown size={20} className={cn(
                "transition-transform theme-text",
                expandedSelector === "speakerB" && "rotate-180"
              )} />
            </Button>

            {expandedSelector === "speakerB" && (
              <div className="grid grid-cols-1 gap-1 mt-2 max-h-60 overflow-y-auto border-2 theme-border rounded-md theme-surface">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="h-10 justify-start text-base theme-button border-0 hover:theme-surface-alt"
                    onClick={() => {
                      onLanguageChange("speakerB", lang.code);
                      setExpandedSelector(null);
                    }}
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Your Language - BOTTOM */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium theme-text">You speak</h2>
            
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-12 text-left theme-button border-2 theme-border hover:theme-surface-alt",
                expandedSelector === "speakerA" && "theme-surface-alt"
              )}
              onClick={() => setExpandedSelector(expandedSelector === "speakerA" ? null : "speakerA")}
            >
              <span className="text-base font-medium theme-text">{getLanguageName(selectedLanguages.speakerA)}</span>
              <ChevronDown size={20} className={cn(
                "transition-transform theme-text",
                expandedSelector === "speakerA" && "rotate-180"
              )} />
            </Button>

            {expandedSelector === "speakerA" && (
              <div className="grid grid-cols-1 gap-1 mt-2 max-h-60 overflow-y-auto border-2 theme-border rounded-md theme-surface">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="h-10 justify-start text-base theme-button border-0 hover:theme-surface-alt"
                    onClick={() => {
                      onLanguageChange("speakerA", lang.code);
                      setExpandedSelector(null);
                    }}
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="p-6">
        <Button
          className="w-full h-12 button--strong hover:opacity-90 text-base font-medium"
          disabled={!isReady}
          onClick={onContinue}
        >
          {showAsSettings ? "Save" : "Continue"}
        </Button>
      </div>
    </div>
  );
};