"use client"

import { Button } from "@/components/ui/button"
import { Undo, FolderDown, Archive } from "lucide-react"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { cn } from "@/lib/utils"

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
  const device = useDeviceDetection()

  return (
    <div className={cn("grid gap-2", device.isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
      <Button
        onClick={onUndo}
        size="sm"
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 text-xs bg-transparent border-border/50 justify-center",
          device.isMobile ? "h-10" : "h-8",
        )}
        disabled={!canUndo}
        title={canUndo ? "Undo last action" : "Nothing to undo"}
      >
        <Undo className={cn(device.isMobile ? "w-4 h-4" : "w-3.5 h-3.5")} />
        <span className={device.isMobile ? "inline" : "hidden sm:inline lg:hidden xl:inline"}>Undo</span>
      </Button>

      {hasFileSystemAccess && (
        <Button
          onClick={onDownloadAsFolder}
          size="sm"
          className={cn("flex items-center gap-1.5 text-xs justify-center", device.isMobile ? "h-10" : "h-8")}
          disabled={!hasContent || isDownloading}
        >
          <FolderDown className={cn(device.isMobile ? "w-4 h-4" : "w-3.5 h-3.5")} />
          <span className={device.isMobile ? "inline" : "hidden sm:inline lg:hidden xl:inline"}>
            {isDownloading ? "Creating..." : "Save"}
          </span>
        </Button>
      )}

      <Button
        onClick={onDownloadAsZip}
        size="sm"
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 bg-transparent border-border/50 text-xs justify-center",
          device.isMobile ? "h-10" : "h-8",
        )}
        disabled={!hasContent}
      >
        <Archive className={cn(device.isMobile ? "w-4 h-4" : "w-3.5 h-3.5")} />
        <span className={device.isMobile ? "inline" : "hidden sm:inline lg:hidden xl:inline"}>ZIP</span>
      </Button>
    </div>
  )
}
