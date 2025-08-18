import { Settings, Shield, Mic2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
  onOpenVoiceSelection: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const CentralVolumeControl = ({
  onOpenSettings,
  onOpenAdminSettings,
  onOpenVoiceSelection,
  isDarkMode,
  onToggleDarkMode
}: CentralVolumeControlProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Settings Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-8 w-8 rounded-full"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenVoiceSelection}
          className="h-8 w-8 rounded-full border-accent/50 hover:border-accent"
          title="Voice Selection"
        >
          <Mic2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-full"
        >
          <Settings className="h-4 w-4" />
        </Button>
        {onOpenAdminSettings && (
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenAdminSettings}
            className="h-8 w-8 rounded-full border-primary/50 hover:border-primary"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};