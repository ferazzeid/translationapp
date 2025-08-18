import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageAreaProps {
  children: ReactNode;
  speaker: "A" | "B";
  className?: string;
}

export const MessageArea = ({ children, speaker, className }: MessageAreaProps) => {
  const isTop = speaker === "A";
  
  return (
    <div className={cn(
      "flex-1 p-4 overflow-y-auto",
      isTop ? "flex flex-col-reverse" : "flex flex-col",
      className
    )}>
      <div className="space-y-3 min-h-0">
        {children}
      </div>
    </div>
  );
};