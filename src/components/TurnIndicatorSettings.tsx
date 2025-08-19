import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TurnIndicatorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const COLOR_OPTIONS = [
  { name: "Green", value: "green", preview: "bg-green-200" },
  { name: "Blue", value: "blue", preview: "bg-blue-200" },
  { name: "Purple", value: "purple", preview: "bg-purple-200" },
  { name: "Yellow", value: "yellow", preview: "bg-yellow-200" },
  { name: "Pink", value: "pink", preview: "bg-pink-200" },
  { name: "Orange", value: "orange", preview: "bg-orange-200" },
];

export const TurnIndicatorSettings = ({
  isOpen,
  onClose,
  currentColor,
  onColorChange
}: TurnIndicatorSettingsProps) => {
  const [tempColor, setTempColor] = useState(currentColor);

  const handleSave = () => {
    onColorChange(tempColor);
    onClose();
  };

  const handleCancel = () => {
    setTempColor(currentColor);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-lg p-0">
        <DialogTitle className="sr-only">Turn Indicator Settings</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">Turn Indicator Color</span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <Label className="text-sm font-medium text-foreground">
            Choose the background color for your speaking turn:
          </Label>
          
          <div className="grid grid-cols-2 gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                onClick={() => setTempColor(color.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted ${
                  tempColor === color.value 
                    ? "border-primary bg-primary/10" 
                    : "border-border"
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${color.preview} border border-border`} />
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};