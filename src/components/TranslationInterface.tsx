import { RealtimeInterface } from "./RealtimeInterface";

interface TranslationInterfaceProps {
  speakerALanguage: string;
  speakerBLanguage: string;
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
}

export const TranslationInterface = ({
  speakerALanguage,
  speakerBLanguage,
  onOpenSettings,
  onOpenAdminSettings
}: TranslationInterfaceProps) => {
  return (
    <RealtimeInterface
      speakerALanguage={speakerALanguage}
      speakerBLanguage={speakerBLanguage}
      onOpenSettings={onOpenSettings}
    />
  );
};