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
    <div className={cn("h-full w-full flex flex-col bg-background relative", className)}>
      {/* Messages area - fills available space but leaves room for button */}
      <div className="flex-1 min-h-0 pb-20"> {/* pb-20 gives space for the fixed button */}
        <MessageArea speaker={speaker}>
          {messages}
        </MessageArea>
      </div>

      {/* Fixed microphone button at bottom - always visible */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center py-4 bg-background z-20">
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