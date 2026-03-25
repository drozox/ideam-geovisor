import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f7681] focus:ring-offset-2",
        {
          "border-transparent bg-[#0f7681] text-white hover:bg-[#0c6670]":
            variant === "default",
          "border-transparent bg-[#e7f6f7] text-[#0d2f36] hover:bg-[#d9edef]":
            variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80":
            variant === "destructive",
          "border-[#d7e8ea] bg-white/70 text-[#24484e] hover:bg-[#eef8f8]":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
