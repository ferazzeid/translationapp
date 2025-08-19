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
        className="h-10 w-10 rounded-full bg-gray-600 text-white border-2 border-gray-500 hover:bg-gray-500 shadow-sm"
        title="Admin Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};