import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  language: string;
  accent?: string;
  isDefault?: boolean;
}

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  speaker?: "A" | "B"; // Add speaker prop for orientation
}

const AVAILABLE_VOICES: Voice[] = [
  { id: "alloy", name: "Alloy", gender: "female", language: "English", isDefault: true },
  { id: "echo", name: "Echo", gender: "male", language: "English" },
  { id: "fable", name: "Fable", gender: "male", language: "English" },
  { id: "onyx", name: "Onyx", gender: "male", language: "English" },
  { id: "nova", name: "Nova", gender: "female", language: "English" },
  { id: "shimmer", name: "Shimmer", gender: "female", language: "English" },
];

export const VoiceSelectionModal = ({
  isOpen,
  onClose,
  selectedVoice,
  onVoiceSelect,
  speaker = "B"
}: VoiceSelectionModalProps) => {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const handleVoiceSelect = (voiceId: string) => {
    onVoiceSelect(voiceId);
    onClose();
  };

  const handlePreviewVoice = async (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);
    
    try {
      // Call text-to-speech function with preview text
      const { data } = await fetch('/api/supabase/functions/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hello, this is a voice preview",
          voice: voiceId,
          language: "en"
        })
      }).then(res => res.json());

      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.onended = () => setPlayingVoice(null);
        await audio.play();
      }
    } catch (error) {
      console.error('Voice preview error:', error);
      setPlayingVoice(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-xs bg-background border border-border shadow-lg p-0",
        speaker === "A" && "rotate-180"
      )}>
        <DialogTitle className="sr-only">Voice Selection</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">Voice Selection</span>
        </div>
        
        {/* Voice List */}
        <div className="p-4 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
          {AVAILABLE_VOICES.map((voice) => (
            <div
              key={voice.id}
              className={cn(
                "flex items-center justify-between p-3 rounded border cursor-pointer transition-colors",
                selectedVoice === voice.id
                  ? "border-foreground bg-muted"
                  : "border-border hover:bg-muted/50"
              )}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{voice.name}</span>
                  <span className="text-xs text-muted-foreground">({voice.gender})</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 text-foreground hover:bg-foreground hover:text-background"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice(voice.id);
                }}
              >
                {playingVoice === voice.id ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};