import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakerButton } from "./SpeakerButton";

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
  const buttonPosition = isTop ? "bottom-6" : "top-6";
  
  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Microphone Button */}
      <div className={cn("absolute left-1/2 -translate-x-1/2 z-20", buttonPosition)}>
        <SpeakerButton
          speaker={speaker}
          isListening={isListening}
          onStart={onStart}
          onStop={onStop}
          language={language}
          flag={flag}
        />
      </div>

      {/* Speech Bubbles Area - Chat Style with proper spacing from center */}
      <div className={cn(
        "absolute inset-x-0 overflow-y-auto",
        isTop ? "top-0 bottom-24 flex flex-col-reverse" : "bottom-0 top-24 flex flex-col"
      )}>
        <div className="flex-1 py-4">
          {messages}
        </div>
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