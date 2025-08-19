import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminControlsProps {
  onOpenAdminSettings: () => void;
}

export const AdminControls = ({
  onOpenAdminSettings
}: AdminControlsProps) => {
  return (
    <div className="absolute bottom-20 left-6 z-40">
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenAdminSettings}
        className="h-10 w-10 rounded-full bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-100 shadow-sm"
        title="Admin Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};