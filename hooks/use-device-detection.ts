"use client"

import { useState, useEffect } from "react"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  hasTouch: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  platform: string
  userAgent: string
  orientation: "portrait" | "landscape"
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Default values for SSR
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenWidth: 1024,
      screenHeight: 768,
      pixelRatio: 1,
      platform: "unknown",
      userAgent: "",
      orientation: "landscape",
      breakpoint: "lg",
    }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const userAgent = navigator.userAgent
      const platform = navigator.platform
      const pixelRatio = window.devicePixelRatio || 1

      // Determine device type
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024 && hasTouch
      const isDesktop = width >= 1024

      // Determine orientation
      const orientation = width > height ? "landscape" : "portrait"

      // Determine breakpoint
      let breakpoint: DeviceInfo["breakpoint"] = "lg"
      if (width < 640) breakpoint = "xs"
      else if (width < 768) breakpoint = "sm"
      else if (width < 1024) breakpoint = "md"
      else if (width < 1280) breakpoint = "lg"
      else if (width < 1536) breakpoint = "xl"
      else breakpoint = "2xl"

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch,
        screenWidth: width,
        screenHeight: height,
        pixelRatio,
        platform,
        userAgent,
        orientation,
        breakpoint,
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener("resize", updateDeviceInfo)
    window.addEventListener("orientationchange", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      window.removeEventListener("orientationchange", updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
