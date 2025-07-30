"use client"

import { useState, useEffect } from "react"

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  screenWidth: number
  screenHeight: number
  orientation: "portrait" | "landscape"
  pixelRatio: number
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: 1024,
    screenHeight: 768,
    orientation: "landscape",
    pixelRatio: 1,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const pixelRatio = window.devicePixelRatio || 1

      // Platform detection
      const isIOS = /ipad|iphone|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)

      // Device type detection based on multiple factors
      const isMobile = width < 768 || (isTouchDevice && width < 1024 && !/ipad/.test(userAgent))
      const isTablet =
        (width >= 768 && width < 1024) || /ipad/.test(userAgent) || (isAndroid && width >= 768 && width < 1200)
      const isDesktop = width >= 1024 && !isTouchDevice

      // Orientation
      const orientation = width > height ? "landscape" : "portrait"

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isIOS,
        isAndroid,
        screenWidth: width,
        screenHeight: height,
        orientation,
        pixelRatio,
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize and orientation changes
    window.addEventListener("resize", updateDeviceInfo)
    window.addEventListener("orientationchange", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      window.removeEventListener("orientationchange", updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
