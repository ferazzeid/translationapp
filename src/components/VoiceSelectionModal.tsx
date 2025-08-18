import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Play, Pause } from "lucide-react";
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
  onVoiceSelect
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Selection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {AVAILABLE_VOICES.map((voice) => (
            <div
              key={voice.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer",
                selectedVoice === voice.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
              onClick={() => handleVoiceSelect(voice.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{voice.name}</span>
                  {voice.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      voice.gender === "female" ? "border-pink-200 text-pink-700" : "border-blue-200 text-blue-700"
                    )}
                  >
                    {voice.gender}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {voice.language} {voice.accent && `• ${voice.accent}`}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewVoice(voice.id);
                }}
              >
                {playingVoice === voice.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};