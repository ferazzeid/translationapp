import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitScreenLayoutProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
  centerContent: ReactNode;
  className?: string;
}

export const SplitScreenLayout = ({
  topContent,
  bottomContent,
  centerContent,
  className
}: SplitScreenLayoutProps) => {
  return (
    <div className={cn("h-full w-full relative bg-background overflow-hidden", className)}>
      {/* Top Half - Rotated 180° for across-table viewing */}
      <div className="absolute inset-x-0 top-0 h-1/2 rotate-180 border-b border-border/30">
        {topContent}
      </div>

      {/* Central Control Strip - Increased height for better spacing */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 bg-muted border-t border-b border-border/30 z-30 flex items-center justify-center">
        {centerContent}
      </div>

      {/* Bottom Half - Normal orientation */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 border-t border-border/30">
        {bottomContent}
      </div>
    </div>
  );
};