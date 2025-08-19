import { useState } from "react";
import { ArrowLeft, Languages, Shield, User, Volume2, Palette, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface GeneralSettingsProps {
  onBack: () => void;
  onOpenLanguageSettings: () => void;
  onOpenAdminSettings: () => void;
  onSignOut?: () => void;
  speakerALanguage: string;
  speakerBLanguage: string;
}

const LANGUAGES = [
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

export const GeneralSettings = ({
  onBack,
  onOpenLanguageSettings,
  onOpenAdminSettings,
  onSignOut,
  speakerALanguage,
  speakerBLanguage
}: GeneralSettingsProps) => {
  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || "Unknown";
  };

  const settingsSections = [
    {
      title: "Language Settings",
      icon: Languages,
      description: "Change your conversation languages",
      action: onOpenLanguageSettings,
      info: `You: ${getLanguageName(speakerALanguage)} → Other: ${getLanguageName(speakerBLanguage)}`
    },
    {
      title: "Voice & Audio",
      icon: Volume2,
      description: "Voice selection and audio preferences",
      action: () => {}, // TODO: Implement voice settings
      info: "Configure voice preferences"
    },
    {
      title: "Appearance",
      icon: Palette,
      description: "Theme and display options",
      action: () => {}, // TODO: Implement theme settings
      info: "Customize app appearance"
    },
    {
      title: "About",
      icon: Info,
      description: "App information and help",
      action: () => {}, // TODO: Implement about page
      info: "Version info and support"
    },
    {
      title: "Admin Settings",
      icon: Shield,
      description: "Administrative controls and configuration",
      action: onOpenAdminSettings,
      info: "Advanced settings (admin access required)",
      isAdmin: true
    }
  ];

  return (
    <div className="h-full flex flex-col theme-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b theme-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 rounded-full theme-icon-button hover:theme-icon-button-hover"
        >
          <ArrowLeft className="h-5 w-5 theme-icon" />
        </Button>
        <h1 className="text-2xl font-medium theme-text">Settings</h1>
      </div>

      {/* Scrollable Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {settingsSections.map((section) => (
          <Card key={section.title} className="theme-surface theme-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <section.icon className={cn(
                  "h-5 w-5",
                  section.isAdmin ? "text-orange-500" : "theme-icon"
                )} />
                <span className="theme-text">{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm theme-text-muted mb-3">{section.description}</p>
              {section.info && (
                <p className="text-xs theme-text-muted mb-4 font-mono bg-muted/50 p-2 rounded">
                  {section.info}
                </p>
              )}
              <Button
                variant={section.isAdmin ? "destructive" : "outline"}
                onClick={section.action}
                className={cn(
                  "w-full justify-start",
                  section.isAdmin && "hover:bg-destructive/90"
                )}
                disabled={!section.action || section.action === (() => {})}
              >
                {section.action === (() => {}) ? "Coming Soon" : "Configure"}
              </Button>
            </CardContent>
          </Card>
        ))}

        <Separator className="my-6" />

        {/* Account Section */}
        <Card className="theme-surface theme-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <User className="h-5 w-5 theme-icon" />
              <span className="theme-text">Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm theme-text-muted">Manage your account and data</p>
            
            {onSignOut && (
              <Button
                variant="outline"
                onClick={onSignOut}
                className="w-full justify-start text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/50"
              >
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};