import { useState } from "react";
import { ArrowLeft, Languages, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AppSettings } from "./AppSettings";
import { getLanguageCode } from "@/constants/languages";

interface GeneralSettingsProps {
  onBack: () => void;
  onOpenLanguageSettings: () => void;
  onOpenAdminSettings: () => void;
  onSignOut?: () => void;
  speakerALanguage: string;
  speakerBLanguage: string;
}

export const GeneralSettings = ({
  onBack,
  onOpenLanguageSettings,
  onOpenAdminSettings,
  onSignOut,
  speakerALanguage,
  speakerBLanguage
}: GeneralSettingsProps) => {

  const settingsSections = [
    {
      title: "Language Settings",
      icon: Languages,
      description: "Change your conversation languages",
      action: onOpenLanguageSettings,
      info: `You: ${speakerALanguage} (${getLanguageCode(speakerALanguage)}) → Other: ${speakerBLanguage} (${getLanguageCode(speakerBLanguage)})`
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
                <section.icon className="h-5 w-5 theme-icon" />
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
                variant="outline"
                onClick={section.action}
                className="w-full justify-start"
                disabled={!section.action || section.action === (() => {})}
              >
                Configure
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* App Settings Section */}
        <AppSettings />

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

        {/* Admin Settings Section - Moved to bottom */}
        <Card className="theme-surface theme-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="theme-text">Admin Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm theme-text-muted mb-3">API keys and landing page configuration</p>
            <p className="text-xs theme-text-muted mb-4 font-mono bg-muted/50 p-2 rounded">
              Advanced settings (admin access required)
            </p>
            <Button
              variant="destructive"
              onClick={onOpenAdminSettings}
              className="w-full justify-start hover:bg-destructive/90"
              disabled={!onOpenAdminSettings || onOpenAdminSettings === (() => {})}
            >
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};