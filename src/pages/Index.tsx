import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { IntroductionMode } from "@/components/IntroductionMode";
import { TranslationInterface } from "@/components/TranslationInterface";
import { AdminAuth } from "@/components/AdminAuth";
import { AdminSettings } from "@/components/AdminSettings";
import { MobileFrame } from "@/components/MobileFrame";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type AppState = "setup" | "introduction" | "translation" | "settings" | "admin-auth" | "admin-settings";

interface LanguageSelection {
  speakerA: string;
  speakerB: string;
}

// Language persistence utilities
const STORAGE_KEY = "translation-app-languages";

const loadSavedLanguages = (): LanguageSelection => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.speakerA && parsed.speakerB) {
        return parsed;
      }
    }
  } catch (error) {
    console.log("No saved languages found");
  }
  return { speakerA: "", speakerB: "" };
};

const saveLanguages = (languages: LanguageSelection) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(languages));
  } catch (error) {
    console.log("Failed to save languages");
  }
};

const Index = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageSelection>(loadSavedLanguages);
  const [currentState, setCurrentState] = useState<AppState>(
    selectedLanguages.speakerA && selectedLanguages.speakerB ? "translation" : "setup"
  );
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const handleLanguageChange = (speaker: "speakerA" | "speakerB", language: string) => {
    const newLanguages = {
      ...selectedLanguages,
      [speaker]: language
    };
    setSelectedLanguages(newLanguages);
    saveLanguages(newLanguages);
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

  const handleOpenAdminSettings = () => {
    setCurrentState("admin-auth");
  };

  const handleAdminAuthenticated = (user: User) => {
    setAdminUser(user);
    setCurrentState("admin-settings");
  };

  const handleAdminSignOut = () => {
    setAdminUser(null);
    setCurrentState("setup");
  };

  const handleBackToApp = () => {
    setCurrentState("translation");
  };

  const renderCurrentView = () => {
    const content = (() => {
      switch (currentState) {
        case "setup":
          return (
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={handleLanguageChange}
              onContinue={handleSetupComplete}
              onOpenSettings={handleOpenSettings}
            />
          );
        
        case "introduction":
          return (
            <IntroductionMode
              targetLanguage={selectedLanguages.speakerB}
              onContinueToTranslation={handleContinueToTranslation}
              onOpenSettings={handleOpenSettings}
            />
          );
        
        case "translation":
          return (
            <TranslationInterface
              speakerALanguage={selectedLanguages.speakerA}
              speakerBLanguage={selectedLanguages.speakerB}
              onOpenSettings={handleOpenSettings}
              onOpenAdminSettings={handleOpenAdminSettings}
            />
          );
        
        case "settings":
          return (
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={handleLanguageChange}
              onContinue={() => setCurrentState("translation")}
              onOpenSettings={handleOpenAdminSettings}
              showAsSettings={true}
            />
          );
        
        case "admin-auth":
          return (
            <AdminAuth
              onAdminAuthenticated={handleAdminAuthenticated}
              onBackToApp={handleBackToApp}
            />
          );
        
        case "admin-settings":
          return (
            <AdminSettings
              onBackToApp={handleBackToApp}
              onSignOut={handleAdminSignOut}
            />
          );
        
        default:
          return null;
      }
    })();

    // Don't wrap admin settings and auth in mobile frame
    if (currentState === "admin-auth" || currentState === "admin-settings") {
      return content;
    }

    // Wrap other views in mobile frame
    return (
      <MobileFrame>
        {content}
      </MobileFrame>
    );
  };

  return (
    <div className="min-h-screen">
      {renderCurrentView()}
    </div>
  );
};

export default Index;