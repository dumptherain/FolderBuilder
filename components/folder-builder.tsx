"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder } from "lucide-react"
import { useFileSystem } from "@/hooks/use-file-system"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { MobileFileSystemItem } from "@/components/mobile-file-system-item"
import { PresetSelector } from "@/components/preset-selector"
import { StructureOutline } from "@/components/structure-outline"
import { ActionButtons } from "@/components/action-buttons"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { downloadAsFolder, downloadAsZip } from "@/lib/download-utils"
import { cn } from "@/lib/utils"
import type { FolderPreset } from "@/types/folder"

export default function FolderBuilder() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [clickTimeouts, setClickTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())

  const device = useDeviceDetection()
  const {
    fileSystem,
    canUndo,
    handleUndo,
    handleRename,
    handleDelete,
    handleDuplicate,
    handleToggleExpanded,
    handleAddItem,
    loadPresetStructure,
  } = useFileSystem()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      clickTimeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [clickTimeouts])

  const handlePresetSelect = (preset: FolderPreset) => {
    loadPresetStructure(preset.structure, preset.rootName)
  }

  const handleDownloadAsFolder = () => {
    downloadAsFolder(fileSystem, setIsDownloading)
  }

  const handleDownloadAsZip = () => {
    downloadAsZip(fileSystem)
  }

  const hasFileSystemAccess = mounted && "showDirectoryPicker" in window
  const hasContent = fileSystem[0]?.children?.length > 0

  if (!mounted) {
    return <LoadingSkeleton />
  }

  return (
    <div
      className={cn("gap-6", device.isMobile || device.isTablet ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-2")}
    >
      <Card className="refined-card flex flex-col">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="flex items-center gap-2.5 text-base font-medium">
              <Folder className="w-4 h-4 text-blue-500/80" />
              Structure Builder
            </CardTitle>
          </div>

          <p className={cn("text-muted-foreground/80", device.isMobile ? "text-xs" : "text-xs hidden sm:block")}>
            {device.isMobile || device.isTablet
              ? "Tap to expand • Long press to rename"
              : "Click to expand • Double-click to rename • Hover to add or delete • Ctrl+Z to undo"}
          </p>

          <div className="flex flex-col gap-2.5 pt-3">
            <PresetSelector onPresetSelect={handlePresetSelect} />
            <ActionButtons
              canUndo={canUndo}
              onUndo={handleUndo}
              onDownloadAsFolder={handleDownloadAsFolder}
              onDownloadAsZip={handleDownloadAsZip}
              hasFileSystemAccess={hasFileSystemAccess}
              isDownloading={isDownloading}
              hasContent={hasContent}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-0">
          <div className="p-2">
            {fileSystem.map((item) => (
              <MobileFileSystemItem
                key={item.id}
                item={item}
                onToggleExpanded={handleToggleExpanded}
                onRename={handleRename}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onAddItem={handleAddItem}
                onItemClick={handleToggleExpanded}
                onItemDoubleClick={(itemId, itemName) => {
                  setRenamingId(itemId)
                  setRenameValue(itemName)
                }}
                showQuickAdd={showQuickAdd}
                setShowQuickAdd={setShowQuickAdd}
                renamingId={renamingId}
                setRenamingId={setRenamingId}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                clickTimeouts={clickTimeouts}
                setClickTimeouts={setClickTimeouts}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <StructureOutline fileSystem={fileSystem} />
    </div>
  )
}
