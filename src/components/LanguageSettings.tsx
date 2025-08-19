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
        className="h-10 w-10 rounded-full bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-100 shadow-sm"
        title="Language Settings"
      >
        <Globe className="h-4 w-4" />
      </Button>
    </div>
  );
};