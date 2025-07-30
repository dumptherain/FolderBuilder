"use client"

import { Button } from "@/components/ui/button"
import { Archive, FolderDown, Undo } from "lucide-react"

interface ActionButtonsProps {
  canUndo: boolean
  onUndo: () => void
  onDownloadAsFolder: () => void
  onDownloadAsZip: () => void
  hasFileSystemAccess: boolean
  isDownloading: boolean
  hasContent: boolean
}

export function ActionButtons({
  canUndo,
  onUndo,
  onDownloadAsFolder,
  onDownloadAsZip,
  hasFileSystemAccess,
  isDownloading,
  hasContent,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
      <Button
        onClick={onUndo}
        size="sm"
        variant="outline"
        className="flex items-center gap-1.5 h-8 text-xs bg-transparent border-border/50 justify-center"
        disabled={!canUndo}
        title={`Undo ${canUndo ? "" : ""}`}
      >
        <Undo className="w-3.5 h-3.5" />
        <span className="hidden sm:inline lg:hidden xl:inline">Undo</span>
      </Button>

      {hasFileSystemAccess && (
        <Button
          onClick={onDownloadAsFolder}
          size="sm"
          className="flex items-center gap-1.5 h-8 text-xs justify-center"
          disabled={!hasContent || isDownloading}
        >
          <FolderDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline lg:hidden xl:inline">
            {isDownloading ? "Creating..." : "Save"}
          </span>
        </Button>
      )}

      <Button
        onClick={onDownloadAsZip}
        size="sm"
        variant="outline"
        className="flex items-center gap-1.5 bg-transparent border-border/50 h-8 text-xs justify-center"
        disabled={!hasContent}
      >
        <Archive className="w-3.5 h-3.5" />
        <span className="hidden sm:inline lg:hidden xl:inline">ZIP</span>
      </Button>
    </div>
  )
} 