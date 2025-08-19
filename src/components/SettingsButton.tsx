import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsButtonProps {
  onOpenSettings: () => void;
}

export const SettingsButton = ({
  onOpenSettings
}: SettingsButtonProps) => {
  return (
    <div className="absolute bottom-20 right-5 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenSettings}
        className="h-10 w-10 rounded-full theme-icon-button hover:theme-icon-button-hover"
        title="Settings"
      >
        <Settings className="h-4 w-4 theme-icon theme-icon-hover" />
      </Button>
    </div>
  );
};