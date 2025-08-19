import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageAreaProps {
  children: ReactNode;
  speaker: "A" | "B";
  className?: string;
}

export const MessageArea = ({ children, speaker, className }: MessageAreaProps) => {
  // Both speakers see messages from bottom up (newest at bottom, pushing older ones up)
  return (
    <div className={cn(
      "h-full p-4 overflow-y-auto flex flex-col-reverse scroll-smooth",
      className
    )}>
      <div className="space-y-3 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
};