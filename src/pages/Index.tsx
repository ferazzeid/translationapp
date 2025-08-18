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

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("setup");
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageSelection>({
    speakerA: "",
    speakerB: ""
  });
  const [adminUser, setAdminUser] = useState<User | null>(null);

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
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-muted-foreground mb-4">User settings panel coming soon...</p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => setCurrentState("translation")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Back to Translation
                </button>
                <button 
                  onClick={handleOpenAdminSettings}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border"
                >
                  Admin Settings
                </button>
              </div>
            </div>
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