"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Lightbulb, Keyboard, Mouse, Smartphone } from "lucide-react"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { TouchOptimizedButton } from "./touch-optimized-button"
import { cn } from "@/lib/utils"

export function TipsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const device = useDeviceDetection()

  const tips = [
    {
      icon: device.isTouch ? Smartphone : Mouse,
      title: device.isTouch ? "Touch Controls" : "Mouse Controls",
      items: device.isTouch
        ? [
            "Tap to expand/collapse folders",
            "Long press to rename items",
            "Tap + to add new items",
            "Swipe for quick actions",
          ]
        : [
            "Single click to expand/collapse",
            "Double click to rename",
            "Right click for context menu",
            "Drag to reorder items",
          ],
    },
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      items: [
        "Ctrl/Cmd + Z: Undo last action",
        "Ctrl/Cmd + S: Save preset",
        "Ctrl/Cmd + O: Load preset",
        "Delete: Remove selected item",
      ],
    },
    {
      icon: Lightbulb,
      title: "Pro Tips",
      items: [
        "Use presets for common structures",
        "Export as ZIP for easy sharing",
        "Nested folders create hierarchy",
        "File extensions are preserved",
      ],
    },
  ]

  // On mobile/tablet, show as collapsible card
  if (device.isMobile || device.isTablet) {
    return (
      <Card className="w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle
                  className={cn("flex items-center gap-2", device.isMobile && "text-lg", device.isTablet && "text-xl")}
                >
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Tips & Shortcuts
                </CardTitle>
                <TouchOptimizedButton variant="ghost" size="sm" className="h-8 w-8 p-0" touchTarget="medium">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </TouchOptimizedButton>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {tips.map((section, index) => (
                  <div key={index}>
                    <h4
                      className={cn(
                        "font-medium mb-3 flex items-center gap-2",
                        device.isMobile && "text-base",
                        device.isTablet && "text-lg",
                      )}
                    >
                      <section.icon className="h-4 w-4 text-muted-foreground" />
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.items.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className={cn(
                            "text-muted-foreground flex items-start gap-2",
                            device.isMobile && "text-sm",
                            device.isTablet && "text-base",
                          )}
                        >
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  // On desktop, show as always-visible sidebar
  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Tips & Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tips.map((section, index) => (
            <div key={index}>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <section.icon className="h-4 w-4 text-muted-foreground" />
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
