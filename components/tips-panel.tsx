"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, X, Folder, File, Copy, Trash2, Plus } from "lucide-react"

export function TipsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  const tips = [
    {
      icon: <Folder className="w-4 h-4 text-blue-500" />,
      title: "Quick Add",
      description: "Click the + icon on any folder to quickly add files or subfolders",
    },
    {
      icon: <File className="w-4 h-4 text-green-500" />,
      title: "Double-Click Rename",
      description: "Double-click any item name to rename it instantly",
    },
    {
      icon: <Copy className="w-4 h-4 text-purple-500" />,
      title: "Duplicate Items",
      description: "Use the copy icon to duplicate files or entire folder structures",
    },
    {
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      title: "Smart Delete",
      description: "Delete items with the trash icon - folders and all contents will be removed",
    },
    {
      icon: <Plus className="w-4 h-4 text-orange-500" />,
      title: "Keyboard Shortcuts",
      description: "Press Enter to confirm additions, Escape to cancel operations",
    },
  ]

  return (
    <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${isExpanded ? "w-80" : "w-16"}`}>
      <div className="relative h-full">
        {/* Collapsed State - Button */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isExpanded ? "opacity-0 scale-95 translate-x-1 pointer-events-none" : "opacity-100 scale-100 translate-x-0"
          }`}
        >
          <Button
            onClick={() => setIsExpanded(true)}
            variant="outline"
            size="sm"
            className="w-16 h-16 rounded-xl border-2 border-dashed border-border/50 hover:border-border bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
          >
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Tips</span>
          </Button>
        </div>

        {/* Expanded State - Panel */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isExpanded ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-1 pointer-events-none"
          }`}
        >
          <Card className="h-full border-border/50 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <CardTitle
                  className={`flex items-center gap-2 text-sm font-medium transition-opacity duration-500 ease-out ${
                    isExpanded ? "opacity-100 delay-500" : "opacity-0 duration-150"
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Quick Tips
                </CardTitle>
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 hover:bg-accent/50 transition-opacity duration-500 ease-out ${
                    isExpanded ? "opacity-100 delay-500" : "opacity-0 duration-150"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent
              className={`p-4 space-y-4 overflow-y-auto transition-opacity duration-700 ease-out ${
                isExpanded ? "opacity-100 delay-700" : "opacity-0 duration-150"
              }`}
            >
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-border/30">
                <div className="text-xs text-muted-foreground/70 text-center">💡 More features coming soon!</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
