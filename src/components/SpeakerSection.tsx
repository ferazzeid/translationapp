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
    <div className={cn("h-full w-full flex flex-col bg-background", className)}>
      {/* Messages area - fills available space */}
      <MessageArea speaker={speaker}>
        {messages}
      </MessageArea>

      {/* Fixed microphone button at bottom */}
      <div className="flex justify-center py-4 bg-background border-t border-border">
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