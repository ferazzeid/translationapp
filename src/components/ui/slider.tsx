import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "vertical" 
        ? "h-full w-5 flex-col justify-center" 
        : "w-full h-5",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative overflow-hidden rounded-full theme-slider-track",
      orientation === "vertical" 
        ? "w-2 h-full" 
        : "h-2 w-full grow"
    )}>
      <SliderPrimitive.Range className={cn(
        "absolute theme-slider-range",
        orientation === "vertical" 
          ? "w-full" 
          : "h-full"
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 theme-slider-thumb ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
