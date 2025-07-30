"use client"

import type React from "react"

import { useDeviceDetection } from "@/hooks/use-device-detection"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  const device = useDeviceDetection()

  return (
    <div
      className={cn(
        "w-full h-full",
        // Mobile: Single column, full height
        device.isMobile && "flex flex-col gap-4 p-4 min-h-screen",
        // Tablet: Adaptive layout based on orientation
        device.isTablet && device.orientation === "portrait" && "flex flex-col gap-6 p-6 min-h-screen",
        device.isTablet && device.orientation === "landscape" && "grid grid-cols-2 gap-6 p-6 h-screen",
        // Desktop: Two column grid
        device.isDesktop && "grid grid-cols-1 lg:grid-cols-2 gap-6 h-full",
        className,
      )}
      style={{
        // Handle mobile viewport height issues
        minHeight: device.isMobile ? "100dvh" : undefined,
      }}
    >
      {children}
    </div>
  )
}
