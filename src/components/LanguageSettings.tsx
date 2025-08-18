import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LanguageSettingsProps {
  onOpenSettings: () => void;
}

export const LanguageSettings = ({
  onOpenSettings
}: LanguageSettingsProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenSettings}
        className="h-10 w-10 rounded-full bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
        title="Language Settings"
      >
        <Globe className="h-4 w-4" />
      </Button>
    </div>
  );
};