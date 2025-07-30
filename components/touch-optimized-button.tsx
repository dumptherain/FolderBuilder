"use client"

import type React from "react"
import { forwardRef } from "react"

import { Button } from "@/components/ui/button"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/components/ui/button"

interface TouchOptimizedButtonProps extends ButtonProps {
  children: React.ReactNode
  touchTarget?: "small" | "medium" | "large"
  hapticFeedback?: boolean
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ children, className, touchTarget = "medium", hapticFeedback = true, onClick, ...props }, ref) => {
    const device = useDeviceDetection()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Provide haptic feedback on touch devices
      if (hapticFeedback && device.hasTouch && "vibrate" in navigator) {
        navigator.vibrate(10) // Short vibration
      }

      // Call the original onClick handler
      onClick?.(event)
    }

    // Determine minimum touch target size based on device and preference
    const getTouchTargetClass = () => {
      if (!device.hasTouch) return ""

      switch (touchTarget) {
        case "small":
          return "min-h-[40px] min-w-[40px]"
        case "medium":
          return "min-h-[44px] min-w-[44px]"
        case "large":
          return "min-h-[48px] min-w-[48px]"
        default:
          return "min-h-[44px] min-w-[44px]"
      }
    }

    // Add touch-specific styling
    const touchClasses = device.hasTouch
      ? "active:scale-95 transition-transform duration-150 ease-out"
      : "hover:scale-105 transition-transform duration-200 ease-out"

    return (
      <Button ref={ref} className={cn(getTouchTargetClass(), touchClasses, className)} onClick={handleClick} {...props}>
        {children}
      </Button>
    )
  },
)

TouchOptimizedButton.displayName = "TouchOptimizedButton"
