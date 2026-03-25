import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7681] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#0f7681] text-white shadow-[0_12px_30px_rgba(15,118,129,0.24)] hover:bg-[#0c6670] hover:shadow-[0_18px_38px_rgba(15,118,129,0.26)]": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-[#cfe3e6] bg-white/88 text-[#12343a] shadow-[0_8px_20px_rgba(8,24,29,0.05)] hover:border-[#9ecdd2] hover:bg-[#eef8f8]": variant === "outline",
            "bg-[#e6f6f7] text-[#0d2f36] hover:bg-[#d8f0f2]": variant === "secondary",
            "text-[#0d2f36] hover:bg-white/70 hover:text-[#0a2025]": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
