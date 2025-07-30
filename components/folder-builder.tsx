"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Folder } from "lucide-react"
import { useFileSystem } from "@/hooks/use-file-system"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { FileSystemItemComponent } from "@/components/file-system-item"
import { PresetSelector } from "@/components/preset-selector"
import { StructureOutline } from "@/components/structure-outline"
import { ActionButtons } from "@/components/action-buttons"
import { SavePresetDialog } from "@/components/save-preset-dialog"
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
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false)
  const [presetRefreshTrigger, setPresetRefreshTrigger] = useState(0)

  const device = useDeviceDetection()
  const {
    fileSystem,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleRename,
    handleDelete,
    handleDuplicate,
    handleToggleExpanded,
    handleAddItem,
    loadPresetStructure,
  } = useFileSystem()

  const memoizedFileSystem = useMemo(() => fileSystem, [fileSystem])

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
    downloadAsFolder(memoizedFileSystem, setIsDownloading)
  }

  const handleDownloadAsZip = () => {
    downloadAsZip(memoizedFileSystem)
  }

  const handleSavePreset = () => {
    setShowSavePresetDialog(true)
  }

  const handlePresetSaved = () => {
    setPresetRefreshTrigger((prev) => prev + 1)
  }

  const handlePresetsChanged = () => {
    setPresetRefreshTrigger((prev) => prev + 1)
  }

  const hasFileSystemAccess = mounted && "showDirectoryPicker" in window

  const hasContent = useMemo(() => {
    return memoizedFileSystem.some((rootItem) => rootItem?.children?.length > 0)
  }, [memoizedFileSystem])

  const itemCount = useMemo(() => {
    const countItems = (items: any[]): number => {
      if (!items || items.length === 0) return 0
      let count = items.length
      items.forEach((item) => {
        if (item.children) {
          count += countItems(item.children)
        }
      })
      return count
    }

    let totalCount = 0
    memoizedFileSystem.forEach((rootItem) => {
      if (rootItem?.children) {
        totalCount += countItems(rootItem.children)
      }
    })

    return totalCount
  }, [memoizedFileSystem])

  const handleItemClick = (itemId: string) => {
    if (itemId !== "root") {
      handleToggleExpanded(itemId)
    }
  }

  if (!mounted) {
    return <LoadingSkeleton />
  }

  return (
    <div className="w-full max-w-none mx-auto space-y-6">
      <div
        className={cn(
          "gap-6 w-full",
          device.isMobile || device.isTablet ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-2",
        )}
      >
        {/* Main Builder Card Column */}
        <div className="flex flex-col w-full gap-4">
          <Card className="flex flex-col w-full border-border/50 shadow-sm min-h-[700px] flex-1">
            <CardHeader className="pb-4 space-y-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-200/20">
                    <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span>Structure Builder</span>
                    {hasContent && (
                      <Badge variant="secondary" className="ml-2 h-5 text-xs">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </div>
              <Separator />
              <div className="space-y-3">
                <PresetSelector onPresetSelect={handlePresetSelect} refreshTrigger={presetRefreshTrigger} />
              </div>
              <Separator />
              <div className="space-y-3">
                <ActionButtons
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  hasContent={hasContent}
                  onPresetsChanged={handlePresetsChanged}
                  showOnlyUndoRedo={true}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 border-t border-border/30">
              <div className="flex-1 p-4">
                <div className="space-y-1">
                  {memoizedFileSystem.map((item) => (
                    <FileSystemItemComponent
                      key={`${item.id}-${item.name}-${item.children?.length || 0}`}
                      item={item}
                      onToggleExpanded={handleToggleExpanded}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onAddItem={handleAddItem}
                      onItemClick={handleItemClick}
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
                  {!hasContent && (
                    <div className="text-center py-8 mt-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                        <Folder className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-sm font-medium mb-1 text-foreground">Empty Root Folder</h3>
                      <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
                        Click the + button on the root folder above to add your first item.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="px-4 py-3 flex items-center min-h-[80px]">
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">PRESET MANAGEMENT</span>
                  <Separator className="flex-1" />
                </div>
                <div className="w-full">
                  <ActionButtons
                    canUndo={false}
                    canRedo={false}
                    onUndo={() => {}}
                    onRedo={() => {}}
                    hasContent={hasContent}
                    onPresetsChanged={handlePresetsChanged}
                    onSavePreset={handleSavePreset}
                    showOnlyPresetActions={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Structure Outline Column */}
        <StructureOutline
          fileSystem={memoizedFileSystem}
          onDownloadAsFolder={handleDownloadAsFolder}
          onDownloadAsZip={handleDownloadAsZip}
          hasFileSystemAccess={hasFileSystemAccess}
          isDownloading={isDownloading}
          hasContent={hasContent}
        />
      </div>

      <SavePresetDialog
        open={showSavePresetDialog}
        onOpenChange={setShowSavePresetDialog}
        fileSystem={memoizedFileSystem}
        onPresetSaved={handlePresetSaved}
      />
    </div>
  )
}
