import React from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: string;
  width?: string | number;
  height?: string | number;
  color?: string;
  inline?: boolean;
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ icon, className, width, height, color, inline = true, ...props }, ref) => {
    return (
      <span 
        ref={ref}
        className={cn("inline-flex", className)} 
        {...props}
      >
        <IconifyIcon 
          icon={icon} 
          width={width || "1em"} 
          height={height || "1em"}
          color={color}
          inline={inline}
        />
      </span>
    );
  }
);

Icon.displayName = "Icon";