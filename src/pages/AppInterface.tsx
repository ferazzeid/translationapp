import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GeneralSettings } from "@/components/GeneralSettings";
import { TranslationInterface } from "@/components/TranslationInterface";
import { AdminAuth } from "@/components/AdminAuth";

import { AdminDashboard } from "@/components/AdminDashboard";
import { AuthPage } from "@/components/AuthPage";
import { MobileFrame } from "@/components/MobileFrame";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

type AppState = "auth" | "setup" | "translation" | "general-settings" | "language-settings" | "admin-auth" | "admin-dashboard";

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
  const { user, session, loading, signOut, isAuthenticated } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageSelection>(loadSavedLanguages);
  const [currentState, setCurrentState] = useState<AppState>("auth");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const { isStandalone } = usePWA();

  // Update state based on authentication - with better session persistence
  useEffect(() => {
    // Don't make routing decisions while auth is still loading
    if (loading) return;
    
    // Only redirect to auth if we're definitely not authenticated
    if (!isAuthenticated && !loading) {
      setCurrentState("auth");
    } else if (isAuthenticated) {
      // User is authenticated, determine correct state
      const hasLanguages = selectedLanguages.speakerA && selectedLanguages.speakerB;
      setCurrentState(hasLanguages ? "translation" : "setup");
    }
  }, [isAuthenticated, loading, selectedLanguages]);

  const handleLanguageChange = (speaker: "speakerA" | "speakerB", language: string) => {
    const newLanguages = {
      ...selectedLanguages,
      [speaker]: language
    };
    setSelectedLanguages(newLanguages);
    saveLanguages(newLanguages);
  };

  const handleLanguageChangesBatch = (speakerA: string, speakerB: string) => {
    const newLanguages = { speakerA, speakerB };
    setSelectedLanguages(newLanguages);
    saveLanguages(newLanguages);
  };

  const handleSetupComplete = () => {
    setCurrentState("translation");
  };

  const handleOpenSettings = () => {
    setCurrentState("general-settings");
  };

  const handleAuthenticated = (user: User, session: Session) => {
    setCurrentState(
      selectedLanguages.speakerA && selectedLanguages.speakerB ? "translation" : "setup"
    );
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentState("auth");
    setAdminUser(null);
    // Clear saved languages on sign out for privacy
    localStorage.removeItem(STORAGE_KEY);
    setSelectedLanguages({ speakerA: "", speakerB: "" });
  };

  const handleAdminAuthenticated = (user: User) => {
    setAdminUser(user);
    setCurrentState("admin-dashboard");
  };

  const handleAdminSignOut = () => {
    setAdminUser(null);
    setCurrentState("setup");
  };

  const handleBackToApp = () => {
    setCurrentState("translation");
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-dvh theme-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'hsl(var(--theme-primary))' }}></div>
        </div>
      );
    }

    const content = (() => {
      switch (currentState) {
        case "auth":
          return <AuthPage onAuthenticated={handleAuthenticated} />;
        
        case "setup":
          return (
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={handleLanguageChange}
              onContinue={handleSetupComplete}
              onOpenSettings={handleOpenSettings}
            />
          );
        
        case "translation":
          return (
            <TranslationInterface
              speakerALanguage={selectedLanguages.speakerA}
              speakerBLanguage={selectedLanguages.speakerB}
              onOpenSettings={handleOpenSettings}
              onOpenAdminSettings={() => setCurrentState("admin-auth")}
              onSignOut={handleSignOut}
              onLanguageChange={handleLanguageChangesBatch}
            />
          );
        
        case "general-settings":
          return (
            <GeneralSettings
              onBack={() => setCurrentState("translation")}
              onOpenLanguageSettings={() => setCurrentState("language-settings")}
              onOpenAdminSettings={() => setCurrentState("admin-auth")}
              onSignOut={handleSignOut}
              speakerALanguage={selectedLanguages.speakerA}
              speakerBLanguage={selectedLanguages.speakerB}
            />
          );
        
        case "language-settings":
          return (
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={handleLanguageChange}
              onContinue={() => setCurrentState("general-settings")}
              showAsSettings={true}
              onSignOut={handleSignOut}
            />
          );
        
        case "admin-auth":
          return (
            <AdminAuth
              onAdminAuthenticated={handleAdminAuthenticated}
              onBackToApp={handleBackToApp}
            />
          );
        
        
        case "admin-dashboard":
          return (
            <AdminDashboard
              onBackToSettings={handleBackToApp}
            />
          );
        
        default:
          return null;
      }
    })();

    // Don't wrap admin auth in mobile frame, but wrap admin dashboard and settings
    if (currentState === "auth" || currentState === "admin-auth") {
      return content;
    }

    // Don't wrap in mobile frame if running as installed PWA or on mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isStandalone || isMobileDevice) {
      return (
        <div className="min-h-screen w-full">
          {content}
        </div>
      );
    }

    // Wrap other views in mobile frame for desktop browser viewing
    return (
      <MobileFrame>
        {content}
      </MobileFrame>
    );
  };

  return (
    <div className="min-h-screen theme-bg">
      {renderCurrentView()}
    </div>
  );
};

export default Index;