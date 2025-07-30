"use client"

import type React from "react"

import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDeviceDetection } from "@/hooks/use-device-detection"

interface TouchOptimizedButtonProps extends ButtonProps {
  touchTarget?: "small" | "medium" | "large"
  hapticFeedback?: boolean
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ className, touchTarget = "medium", hapticFeedback = true, onClick, children, ...props }, ref) => {
    const device = useDeviceDetection()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Provide haptic feedback on supported devices
      if (hapticFeedback && device.supportsHaptics && navigator.vibrate) {
        navigator.vibrate(10) // Short vibration
      }

      onClick?.(e)
    }

    const touchTargetClasses = {
      small: "min-h-[36px] min-w-[36px]",
      medium: "min-h-[44px] min-w-[44px]",
      large: "min-h-[48px] min-w-[48px]",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          // Base touch optimizations
          device.isTouch && "active:scale-95 transition-transform duration-75",
          device.isTouch && touchTargetClasses[touchTarget],
          // Enhanced touch feedback
          device.isTouch && "touch-manipulation select-none",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

TouchOptimizedButton.displayName = "TouchOptimizedButton"
