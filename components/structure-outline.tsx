"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File } from "lucide-react"
import { FileSystemItem } from "@/types/folder"
import { generateOutline } from "@/lib/folder-utils"

interface StructureOutlineProps {
  fileSystem: FileSystemItem[]
}

export function StructureOutline({ fileSystem }: StructureOutlineProps) {
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
            <p className="text-sm">Your folder structure will appear here</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Start by adding items to the root folder</p>
          </div>
        ) : (
          <div className="content-area rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal text-foreground/90">
              {generateOutline(fileSystem)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 