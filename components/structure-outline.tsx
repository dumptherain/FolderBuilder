"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File } from "lucide-react"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { cn } from "@/lib/utils"
import type { FileSystemItem } from "@/types/folder"

interface StructureOutlineProps {
  fileSystem: FileSystemItem[]
}

export function StructureOutline({ fileSystem }: StructureOutlineProps) {
  const device = useDeviceDetection()

  const generateOutline = (structure: FileSystemItem[]): string => {
    const rootName = structure[0]?.name || "root"
    let treeString = `📁 ${rootName}\n`

    const buildTree = (items: FileSystemItem[], prefix: string) => {
      items.forEach((item, index) => {
        const isLast = index === items.length - 1
        const connector = isLast ? "└─" : "├─"
        const icon = item.type === "folder" ? "📁" : "📄"
        treeString += `${prefix}${connector} ${icon} ${item.name}\n`

        if (item.children && item.children.length > 0) {
          const newPrefix = prefix + (isLast ? "    " : "│   ")
          buildTree(item.children, newPrefix)
        }
      })
    }

    if (structure[0] && structure[0].children) {
      buildTree(structure[0].children, "")
    }

    return treeString
  }

  return (
    <Card className="refined-card flex flex-col">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2.5 text-base font-medium">
          <File className="w-4 h-4 text-muted-foreground/70" />
          Structure Outline
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        {fileSystem[0]?.children?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/60">
            <div className="text-3xl mb-3">🌳</div>
            <p className={cn("font-medium", device.isMobile ? "text-base" : "text-sm")}>
              Your folder structure will appear here
            </p>
            <p className={cn("text-muted-foreground/50 mt-1", device.isMobile ? "text-sm" : "text-xs")}>
              Start by adding items to the root folder
            </p>
          </div>
        ) : (
          <div className="content-area rounded-lg p-4 font-mono leading-relaxed overflow-x-auto">
            <pre
              className={cn(
                "whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal text-foreground/90",
                device.isMobile ? "text-sm" : "text-xs",
              )}
            >
              {generateOutline(fileSystem)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
