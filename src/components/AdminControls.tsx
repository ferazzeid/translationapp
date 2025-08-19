import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminControlsProps {
  onOpenAdminSettings: () => void;
}

export const AdminControls = ({
  onOpenAdminSettings
}: AdminControlsProps) => {
  return (
    <div className="absolute bottom-20 left-4 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenAdminSettings}
        className="h-8 w-8 rounded-full bg-background/90 border border-border hover:bg-foreground hover:text-background shadow-sm"
        title="Admin Settings"
      >
        <Settings className="h-3 w-3" />
      </Button>
    </div>
  );
};