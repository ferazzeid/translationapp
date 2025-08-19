import { UnifiedTranslationInterface } from "./UnifiedTranslationInterface";

interface TranslationInterfaceProps {
  speakerALanguage: string;
  speakerBLanguage: string;
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
  onSignOut?: () => void;
  onLanguageChange?: (speakerA: string, speakerB: string) => void;
}

export const TranslationInterface = ({ 
  speakerALanguage, 
  speakerBLanguage, 
  onOpenSettings, 
  onOpenAdminSettings, 
  onSignOut,
  onLanguageChange
}: TranslationInterfaceProps) => {
  return (
    <UnifiedTranslationInterface
      speakerALanguage={speakerALanguage}
      speakerBLanguage={speakerBLanguage}
      onOpenSettings={onOpenSettings}
      onOpenAdminSettings={onOpenAdminSettings}
      onSignOut={onSignOut}
      onLanguageChange={onLanguageChange}
    />
  );
};