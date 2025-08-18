import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SimpleLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakerALanguage: string;
  speakerBLanguage: string;
  onSpeakerALanguageChange: (language: string) => void;
  onSpeakerBLanguageChange: (language: string) => void;
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
  onSpeakerALanguageChange,
  onSpeakerBLanguageChange
}: SimpleLanguageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-lg p-0">
        <DialogTitle className="sr-only">Language Selection</DialogTitle>
        
        {/* Single Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 h-6 w-6 text-foreground hover:bg-foreground hover:text-background z-50"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="pt-8 pb-4 px-4 space-y-4">
          {/* First Language */}
          <Select value={speakerALanguage} onValueChange={onSpeakerALanguageChange}>
            <SelectTrigger className="w-full bg-background border border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              {LANGUAGES.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="text-foreground hover:bg-muted"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Second Language */}
          <Select value={speakerBLanguage} onValueChange={onSpeakerBLanguageChange}>
            <SelectTrigger className="w-full bg-background border border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              {LANGUAGES.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="text-foreground hover:bg-muted"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};