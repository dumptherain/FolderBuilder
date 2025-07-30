"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MobileOptimizedCardProps {
  title?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function MobileOptimizedCard({ title, children, className, headerAction }: MobileOptimizedCardProps) {
  const device = useDeviceDetection()

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        // Mobile optimizations
        device.isMobile && ["border-0 shadow-sm rounded-lg", "mx-0 mb-4"],
        // Tablet optimizations
        device.isTablet && ["border border-border/50 shadow-md rounded-xl", "mx-2 mb-6"],
        // Desktop
        device.isDesktop && ["border border-border/50 shadow-lg rounded-xl", "mb-6"],
        className,
      )}
    >
      {title && (
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            device.isMobile && "px-4 py-3",
            device.isTablet && "px-5 py-4",
            device.isDesktop && "px-6 py-4",
          )}
        >
          <CardTitle
            className={cn(
              "font-semibold",
              device.isMobile && "text-lg",
              device.isTablet && "text-xl",
              device.isDesktop && "text-xl",
            )}
          >
            {title}
          </CardTitle>
          {headerAction}
        </CardHeader>
      )}
      <CardContent
        className={cn(device.isMobile && "px-4 pb-4", device.isTablet && "px-5 pb-5", device.isDesktop && "px-6 pb-6")}
      >
        {children}
      </CardContent>
    </Card>
  )
}
