import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: "Hello, this is a voice preview",
          voice: voiceId,
          language: "en"
        }
      });

      if (error) throw error;
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
        "max-w-xs theme-modal-bg theme-modal-border shadow-lg p-0",
        speaker === "B" && "rotate-180"
      )}>
        <DialogTitle className="sr-only">Voice Selection</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b theme-modal-border theme-modal-header-bg">
          <span className="text-sm font-medium theme-text">Voice Selection</span>
        </div>
        
        {/* Voice List */}
        <div className="p-4 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
          {AVAILABLE_VOICES.map((voice) => (
            <div
              key={voice.id}
              className={cn(
                "flex items-center justify-between p-3 rounded border cursor-pointer transition-colors",
                selectedVoice === voice.id
                  ? "theme-modal-border theme-surface-alt"
                  : "theme-modal-border hover:theme-dropdown-hover"
              )}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium theme-text text-sm">{voice.name}</span>
                  <span className="text-xs theme-text-muted">({voice.gender})</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 theme-icon theme-icon-hover hover:theme-surface-alt"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice(voice.id);
                }}
              >
                {playingVoice === voice.id ? (
                  <Pause className="h-3 w-3 theme-icon" />
                ) : (
                  <Play className="h-3 w-3 theme-icon" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};