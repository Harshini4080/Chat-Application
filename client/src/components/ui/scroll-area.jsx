import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils"; 

// ScrollArea root component that wraps content with custom scroll behavior
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)} 
    {...props}
  >
    {/* Viewport to render scrollable content */}
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>

    {/* Custom vertical or horizontal scrollbar */}
    <ScrollBar />

    {/* Optional corner for dual scroll support */}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// ScrollBar component for both vertical and horizontal scroll
const ScrollBar = React.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors", // Smooth appearance
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]", // Vertical styling
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]", // Horizontal styling
        className
      )}
      {...props}
    >
      {/* Thumb (draggable part) of scrollbar */}
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
