"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Keyboard,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Sparkles,
  MousePointer,
  Copy,
} from "lucide-react"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { TouchOptimizedButton } from "@/components/touch-optimized-button"

export function TipsPanel() {
  const device = useDeviceDetection()
  const [isOpen, setIsOpen] = useLocalStorage("tips-panel-open", false)

  const getDeviceIcon = () => {
    if (device.isMobile) return Smartphone
    if (device.isTablet) return Tablet
    return Monitor
  }

  const getControlsTitle = () => {
    if (device.isMobile) return "Mobile Controls"
    if (device.isTablet) return "Tablet Controls"
    return "Desktop Controls"
  }

  const getControlsItems = () => {
    if (device.hasTouch) {
      return [
        "Tap folder to expand/collapse",
        "Long press any item to rename",
        "Tap + button to add folders/files",
        "Use dropdown menu for more actions",
        "Swipe gestures for quick navigation",
      ]
    }
    return [
      "Single click folder to expand/collapse",
      "Double click any item to rename",
      "Hover over items for action buttons",
      "Right-click for context menu",
      "Click outside input to cancel rename",
    ]
  }

  const tips = [
    {
      icon: getDeviceIcon(),
      title: getControlsTitle(),
      items: getControlsItems(),
    },
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      items: [
        "Ctrl/Cmd + Z: Undo last action",
        "Enter: Confirm rename/add operation",
        "Escape: Cancel current operation",
        "Tab: Navigate between elements",
        "Space: Toggle folder expansion",
      ],
    },
    {
      icon: MousePointer,
      title: "Item Actions",
      items: [
        "Add: Create new folders and files",
        "Rename: Double-click or long press",
        "Delete: Remove items permanently",
        "Duplicate: Copy items with '_copy' suffix",
        "Drag handles for visual feedback",
      ],
    },
    {
      icon: Sparkles,
      title: "Presets & Templates",
      items: [
        "Load built-in presets (Next.js, React, etc.)",
        "Save custom presets for reuse",
        "Import/Export preset files (.json)",
        "Delete custom presets when needed",
        "Share presets with your team",
      ],
    },
    {
      icon: Download,
      title: "Export Options",
      items: [
        "Create Folders: Direct folder creation",
        "Download ZIP: Universal file format",
        "Preserves exact folder structure",
        "Empty folders include .gitkeep files",
        "Smart filename generation",
      ],
    },
    {
      icon: Copy,
      title: "Multi-Root Support",
      items: [
        "Duplicate root folders for complex projects",
        "Each root appears in structure outline",
        "Item counter includes all roots",
        "Export handles multiple root folders",
        "Presets support multi-root structures",
      ],
    },
  ]

  return (
    <Card className="w-full border-border/30 bg-muted/20 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-yellow-500/70" />
                Tips & Shortcuts
              </CardTitle>
              <TouchOptimizedButton variant="ghost" size="sm" className="h-7 w-7 p-0" touchTarget="small">
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </TouchOptimizedButton>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tips.map((section, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-md bg-background/50 border border-border/20">
                  <div className="flex-shrink-0 mt-0.5">
                    <section.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-foreground/80 mb-2">{section.title}</h4>
                    <ul className="space-y-1">
                      {section.items.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className="text-xs text-muted-foreground/80 leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="w-1 h-1 bg-muted-foreground/50 rounded-full mt-1.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-border/20 space-y-3">
              <div className="text-xs text-muted-foreground/60 text-center">
                💡 <strong>Pro tip:</strong> Save frequently used structures as custom presets for quick reuse
              </div>
              <div className="text-xs text-muted-foreground/60 text-center">
                🚀 <strong>Advanced:</strong> Duplicate root folders to create complex multi-project structures
              </div>
              <div className="text-xs text-muted-foreground/60 text-center">
                📁 <strong>Export:</strong> Choose between direct folder creation, ZIP download, or both
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
