import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LanguageSettingsProps {
  onOpenSettings: () => void;
}

export const LanguageSettings = ({
  onOpenSettings
}: LanguageSettingsProps) => {
  return (
    <div className="absolute bottom-20 right-6 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenSettings}
        className="h-10 w-10 rounded-full theme-button border-2"
        title="Language Settings"
      >
        <Globe className="h-4 w-4" />
      </Button>
    </div>
  );
};