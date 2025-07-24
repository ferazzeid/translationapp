import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { IntroductionMode } from "@/components/IntroductionMode";
import { TranslationInterface } from "@/components/TranslationInterface";

type AppState = "setup" | "introduction" | "translation" | "settings";

interface LanguageSelection {
  speakerA: string;
  speakerB: string;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("setup");
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageSelection>({
    speakerA: "",
    speakerB: ""
  });

  const handleLanguageChange = (speaker: "speakerA" | "speakerB", language: string) => {
    setSelectedLanguages(prev => ({
      ...prev,
      [speaker]: language
    }));
  };

  const handleSetupComplete = () => {
    setCurrentState("introduction");
  };

  const handleContinueToTranslation = () => {
    setCurrentState("translation");
  };

  const handleOpenSettings = () => {
    setCurrentState("settings");
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "setup":
        return (
          <LanguageSelector
            selectedLanguages={selectedLanguages}
            onLanguageChange={handleLanguageChange}
            onContinue={handleSetupComplete}
          />
        );
      
      case "introduction":
        return (
          <IntroductionMode
            targetLanguage={selectedLanguages.speakerB}
            onContinueToTranslation={handleContinueToTranslation}
          />
        );
      
      case "translation":
        return (
          <TranslationInterface
            speakerALanguage={selectedLanguages.speakerA}
            speakerBLanguage={selectedLanguages.speakerB}
            onOpenSettings={handleOpenSettings}
          />
        );
      
      case "settings":
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground mb-4">Settings panel coming soon...</p>
            <button 
              onClick={() => setCurrentState("translation")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Back to Translation
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}
    </div>
  );
};

export default Index;