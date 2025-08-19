import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslationInterface } from "@/components/TranslationInterface";
import { AdminAuth } from "@/components/AdminAuth";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AuthPage } from "@/components/AuthPage";
import { MobileFrame } from "@/components/MobileFrame";
import { useAuth } from "@/hooks/useAuth";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

type AppState = "auth" | "setup" | "translation" | "settings" | "admin-auth" | "admin-settings" | "admin-dashboard";

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

  // Update state based on authentication
  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      setCurrentState("auth");
    } else {
      setCurrentState(
        selectedLanguages.speakerA && selectedLanguages.speakerB ? "translation" : "setup"
      );
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

  const handleSetupComplete = () => {
    setCurrentState("translation");
  };

  const handleOpenSettings = () => {
    setCurrentState("settings");
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
    if (loading) {
      return (
        <div className="min-h-dvh bg-gradient-surface flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    const content = (() => {
      switch (currentState) {
        case "auth":
          return <AuthPage onAuthenticated={handleAuthenticated} />;
        
        case "setup":
          return (
            <div className="relative">
              {isAuthenticated && (
                <div className="absolute top-4 right-4 flex gap-2 z-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentState("admin-auth")}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              )}
              <LanguageSelector
                selectedLanguages={selectedLanguages}
                onLanguageChange={handleLanguageChange}
                onContinue={handleSetupComplete}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          );
        
        case "translation":
          return (
            <TranslationInterface
              speakerALanguage={selectedLanguages.speakerA}
              speakerBLanguage={selectedLanguages.speakerB}
              onOpenSettings={handleOpenSettings}
              onOpenAdminSettings={() => setCurrentState("admin-auth")}
              onSignOut={handleSignOut}
            />
          );
        
        case "settings":
          return (
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={handleLanguageChange}
              onContinue={() => setCurrentState("translation")}
              onOpenSettings={() => setCurrentState("admin-auth")}
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
        
        case "admin-settings":
          return (
            <AdminSettings
              onBackToApp={handleBackToApp}
              onSignOut={handleAdminSignOut}
              onOpenDashboard={() => setCurrentState("admin-dashboard")}
            />
          );
        
        case "admin-dashboard":
          return (
            <AdminDashboard
              onBackToSettings={() => setCurrentState("admin-settings")}
            />
          );
        
        default:
          return null;
      }
    })();

    // Don't wrap admin settings, dashboard, and auth in mobile frame
    if (currentState === "admin-auth" || currentState === "admin-settings" || currentState === "admin-dashboard" || currentState === "auth") {
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
    <div className="min-h-screen">
      {renderCurrentView()}
    </div>
  );
};

export default Index;