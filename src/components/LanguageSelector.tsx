import { useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
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
}

export const LanguageSelector = ({ 
  selectedLanguages, 
  onLanguageChange, 
  onContinue 
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
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
          <Languages size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Setup Conversation</h1>
        <p className="text-muted-foreground">Select the languages for your conversation</p>
      </div>

      <div className="space-y-4">
        {/* Speaker A Language */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-speaker-a"></div>
            <span className="font-semibold text-foreground">Your Language</span>
          </div>
          
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-12 text-left",
              expandedSelector === "speakerA" && "ring-2 ring-primary"
            )}
            onClick={() => setExpandedSelector(expandedSelector === "speakerA" ? null : "speakerA")}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getLanguageFlag(selectedLanguages.speakerA)}</span>
              <span className="font-medium">{getLanguageName(selectedLanguages.speakerA)}</span>
            </div>
            <ChevronDown size={20} className={cn(
              "transition-transform",
              expandedSelector === "speakerA" && "rotate-180"
            )} />
          </Button>

          {expandedSelector === "speakerA" && (
            <div className="grid grid-cols-1 gap-2 mt-2 animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className="h-10 justify-start"
                  onClick={() => {
                    onLanguageChange("speakerA", lang.code);
                    setExpandedSelector(null);
                  }}
                >
                  <span className="text-xl mr-3">{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* Speaker B Language */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-speaker-b"></div>
            <span className="font-semibold text-foreground">Other Person's Language</span>
          </div>
          
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-12 text-left",
              expandedSelector === "speakerB" && "ring-2 ring-primary"
            )}
            onClick={() => setExpandedSelector(expandedSelector === "speakerB" ? null : "speakerB")}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getLanguageFlag(selectedLanguages.speakerB)}</span>
              <span className="font-medium">{getLanguageName(selectedLanguages.speakerB)}</span>
            </div>
            <ChevronDown size={20} className={cn(
              "transition-transform",
              expandedSelector === "speakerB" && "rotate-180"
            )} />
          </Button>

          {expandedSelector === "speakerB" && (
            <div className="grid grid-cols-1 gap-2 mt-2 animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className="h-10 justify-start"
                  onClick={() => {
                    onLanguageChange("speakerB", lang.code);
                    setExpandedSelector(null);
                  }}
                >
                  <span className="text-xl mr-3">{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Button
        className="w-full h-12 bg-gradient-primary shadow-medium"
        disabled={!isReady}
        onClick={onContinue}
      >
        Start Conversation
      </Button>
    </div>
  );
};