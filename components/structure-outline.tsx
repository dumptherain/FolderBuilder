"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Folder, FolderOpen, Code2 } from "lucide-react"
import type { FileSystemItem } from "@/types/folder"

interface StructureOutlineProps {
  fileSystem: FileSystemItem[]
}

export function StructureOutline({ fileSystem }: StructureOutlineProps) {
  const outlineText = useMemo(() => {
    const generateOutline = (items: FileSystemItem[], depth = 0): string => {
      return items
        .map((item) => {
          const indent = "  ".repeat(depth)
          const icon = item.type === "folder" ? "📁" : "📄"
          let line = `${indent}${icon} ${item.name}`

          if (item.children && item.children.length > 0) {
            line += "\n" + generateOutline(item.children, depth + 1)
          }

          return line
        })
        .join("\n")
    }

    // Handle multiple root folders
    if (fileSystem.length === 0) {
      return "No structure created yet.\n\nStart by loading a preset or adding folders manually."
    }

    if (fileSystem.length === 1 && fileSystem[0]?.children) {
      // Single root folder - show its children
      const rootItem = fileSystem[0]
      if (rootItem.children.length === 0) {
        return `📁 ${rootItem.name}\n  (empty folder)\n\nAdd some files and folders to see the structure here.`
      }
      return `📁 ${rootItem.name}\n${generateOutline(rootItem.children, 1)}`
    } else {
      // Multiple root folders - show each root folder
      return fileSystem
        .map((rootItem) => {
          if (rootItem.children && rootItem.children.length > 0) {
            return `📁 ${rootItem.name}\n${generateOutline(rootItem.children, 1)}`
          } else {
            return `📁 ${rootItem.name}\n  (empty folder)`
          }
        })
        .join("\n\n")
    }
  }, [fileSystem])

  // Calculate statistics across all root folders
  const stats = useMemo(() => {
    const calculateStats = (items: FileSystemItem[]): { folders: number; files: number; depth: number } => {
      let folders = 0
      let files = 0
      let maxDepth = 0

      const traverse = (items: FileSystemItem[], currentDepth: number) => {
        items.forEach((item) => {
          if (item.type === "folder") {
            folders++
            if (item.children && item.children.length > 0) {
              const childDepth = currentDepth + 1
              maxDepth = Math.max(maxDepth, childDepth)
              traverse(item.children, childDepth)
            }
          } else {
            files++
          }
        })
      }

      traverse(items, 1)
      return { folders, files, depth: maxDepth }
    }

    let totalFolders = 0
    let totalFiles = 0
    let maxDepth = 0

    fileSystem.forEach((rootItem) => {
      if (rootItem.children) {
        const rootStats = calculateStats(rootItem.children)
        totalFolders += rootStats.folders
        totalFiles += rootStats.files
        maxDepth = Math.max(maxDepth, rootStats.depth)
      }
    })

    return {
      folders: totalFolders,
      files: totalFiles,
      depth: maxDepth,
      roots: fileSystem.length,
    }
  }, [fileSystem])

  const hasContent = fileSystem.some((rootItem) => rootItem?.children?.length > 0)

  return (
    <Card className="flex flex-col w-full border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-200/20">
            <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span>Structure Outline</span>
            {hasContent && (
              <div className="flex items-center gap-1">
                {stats.roots > 1 && (
                  <Badge variant="outline" className="h-5 text-xs">
                    {stats.roots} roots
                  </Badge>
                )}
                <Badge variant="secondary" className="h-5 text-xs">
                  <Folder className="w-3 h-3 mr-1" />
                  {stats.folders}
                </Badge>
                <Badge variant="secondary" className="h-5 text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {stats.files}
                </Badge>
                {stats.depth > 0 && (
                  <Badge variant="outline" className="h-5 text-xs">
                    {stats.depth} deep
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="relative">
          <pre className="text-sm font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap break-words bg-muted/20 rounded-lg p-4 border border-border/30 min-h-[200px] overflow-auto">
            {outlineText}
          </pre>

          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Structure will appear here</p>
              </div>
            </div>
          )}
        </div>

        {hasContent && (
          <div className="mt-4 pt-3 border-t border-border/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Total: {stats.folders + stats.files} item{stats.folders + stats.files !== 1 ? "s" : ""}
              </span>
              {stats.depth > 0 && (
                <span>
                  Max depth: {stats.depth} level{stats.depth !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
