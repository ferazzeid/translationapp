import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakerButton } from "./SpeakerButton";
import { MessageArea } from "./MessageArea";

interface SpeakerSectionProps {
  speaker: "A" | "B";
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  language: string;
  flag: string;
  messages: ReactNode;
  isTop?: boolean;
  className?: string;
}

export const SpeakerSection = ({
  speaker,
  isListening,
  onStart,
  onStop,
  language,
  flag,
  messages,
  isTop = false,
  className
}: SpeakerSectionProps) => {
  return (
    <div className={cn("h-full w-full relative bg-background overflow-hidden", className)}>
      {/* Messages area - absolutely contained, can't push anything */}
      <div className="absolute inset-0 bottom-24 overflow-hidden">
        <div className="h-full p-4 overflow-y-auto flex flex-col-reverse">
          <div className="space-y-3 min-h-0">
            {messages}
          </div>
        </div>
      </div>

      {/* Fixed microphone button - completely independent */}
      <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center bg-background z-30">
        <SpeakerButton
          speaker={speaker}
          isListening={isListening}
          onStart={onStart}
          onStop={onStop}
          language={language}
          flag={flag}
        />
      </div>

      {/* Listening feedback overlay */}
      {isListening && (
        <div className={cn(
          "absolute inset-0 animate-pulse pointer-events-none z-10",
          speaker === "A" ? "bg-speaker-a/5" : "bg-speaker-b/5"
        )} />
      )}
    </div>
  );
};