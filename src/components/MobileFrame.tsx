import React from 'react';
import { cn } from "@/lib/utils";

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFrame = ({ children, className }: MobileFrameProps) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className={cn(
        "relative",
        "w-full max-w-sm", // Mobile width constraint
        "h-[800px]", // Fixed mobile height
        "bg-background",
        "rounded-[2.5rem]", // Large border radius for phone-like appearance
        "border-8 border-gray-800", // Phone bezel
        "shadow-2xl",
        "overflow-hidden",
        "mx-auto",
        className
      )}>
        {/* Phone speaker/notch area */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
        
        {/* App content */}
        <div className="h-full w-full relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
};