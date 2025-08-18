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
  const buttonPosition = isTop ? "bottom-12" : "top-12";
  
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

      <div className={cn(
        "absolute inset-x-0 overflow-y-auto px-2",
        isTop ? "top-12 bottom-48 flex flex-col-reverse" : "bottom-12 top-48 flex flex-col"
      )}>
        <div className="flex-1 py-8">
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