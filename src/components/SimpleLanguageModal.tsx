import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SimpleLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakerALanguage: string;
  speakerBLanguage: string;
  onLanguagesSave: (speakerA: string, speakerB: string) => void;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "pl", name: "Polish" },
  { code: "cs", name: "Czech" },
];

export const SimpleLanguageModal = ({
  isOpen,
  onClose,
  speakerALanguage,
  speakerBLanguage,
  onLanguagesSave
}: SimpleLanguageModalProps) => {
  const [tempSpeakerA, setTempSpeakerA] = useState(speakerALanguage);
  const [tempSpeakerB, setTempSpeakerB] = useState(speakerBLanguage);

  // Update temp values when props change
  useEffect(() => {
    setTempSpeakerA(speakerALanguage);
    setTempSpeakerB(speakerBLanguage);
  }, [speakerALanguage, speakerBLanguage]);

  const handleSave = () => {
    onLanguagesSave(tempSpeakerA, tempSpeakerB);
    onClose();
  };

  const handleCancel = () => {
    setTempSpeakerA(speakerALanguage);
    setTempSpeakerB(speakerBLanguage);
    onClose();
  };

  const hasChanges = tempSpeakerA !== speakerALanguage || tempSpeakerB !== speakerBLanguage;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-lg p-0">
        <DialogTitle className="sr-only">Language Selection</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">Language Selection</span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* You speak - Speaker A */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">You speak</label>
            <Select value={tempSpeakerA} onValueChange={setTempSpeakerA}>
              <SelectTrigger className="w-full bg-background border border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {LANGUAGES.map((lang) => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="text-foreground hover:bg-muted focus:bg-muted"
                  >
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other person speaks - Speaker B */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Other person speaks</label>
            <Select value={tempSpeakerB} onValueChange={setTempSpeakerB}>
              <SelectTrigger className="w-full bg-background border border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {LANGUAGES.map((lang) => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="text-foreground hover:bg-muted focus:bg-muted"
                  >
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer with buttons */}
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
            disabled={!tempSpeakerA || !tempSpeakerB}
          >
            Save {hasChanges && "*"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};