import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LanguageSettingsProps {
  onOpenSettings: () => void;
}

export const LanguageSettings = ({
  onOpenSettings
}: LanguageSettingsProps) => {
  return (
    <div className="absolute bottom-20 right-4 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenSettings}
        className="h-8 w-8 rounded-full bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
        title="Language Settings"
      >
        <Globe className="h-3 w-3" />
      </Button>
    </div>
  );
};