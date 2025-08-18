import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminControlsProps {
  onOpenAdminSettings: () => void;
  speaker: "A" | "B";
  isTop?: boolean;
}

export const AdminControls = ({
  onOpenAdminSettings,
  speaker,
  isTop = false
}: AdminControlsProps) => {
  return (
    <div className={`absolute left-1/2 -translate-x-1/2 z-20 ${isTop ? "bottom-20" : "top-20"}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenAdminSettings}
        className="h-10 w-10 rounded-full bg-background/90 border border-primary/50 hover:border-primary shadow-sm"
        title="Admin Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};