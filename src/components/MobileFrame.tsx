import React from 'react';
import { cn } from "@/lib/utils";

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFrame = ({ children, className }: MobileFrameProps) => {
  return (
    <div className="min-h-screen theme-frame-bg flex items-center justify-center p-4">
      <div className={cn(
        "relative",
        "w-full max-w-sm", // Mobile width constraint
        "h-[800px]", // Fixed mobile height
        "theme-surface",
        "rounded-[2.5rem]", // Large border radius for phone-like appearance
        "border-8 theme-frame-border", // Phone bezel - uniform all around
        "shadow-2xl",
        "overflow-hidden",
        "mx-auto",
        className
      )}>
        {/* App content - no notch interference */}
        <div className="h-full w-full relative">
          {children}
        </div>
      </div>
    </div>
  );
};