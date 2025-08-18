import { Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CentralVolumeControlProps {
  onOpenSettings: () => void;
  onOpenAdminSettings?: () => void;
}

export const CentralVolumeControl = ({
  onOpenSettings,
  onOpenAdminSettings
}: CentralVolumeControlProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Settings Buttons */}
      <div className="flex gap-2">
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