"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Folder } from "lucide-react"
import { useFileSystem } from "@/hooks/use-file-system"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { MobileFileSystemItem } from "@/components/mobile-file-system-item"
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
    handleUndo,
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

  // Updated to check if any root folder has content
  const hasContent = useMemo(() => {
    return memoizedFileSystem.some((rootItem) => rootItem?.children?.length > 0)
  }, [memoizedFileSystem])

  // Updated item count to count across all root folders
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
        {/* Main Builder Card */}
        <Card className="flex flex-col w-full border-border/50 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            {/* Header */}
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

            {/* Preset Section */}
            <div className="space-y-3">
              <PresetSelector onPresetSelect={handlePresetSelect} refreshTrigger={presetRefreshTrigger} />
            </div>

            <Separator />

            {/* Actions Section */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Actions</span>
              <ActionButtons
                canUndo={canUndo}
                onUndo={handleUndo}
                onDownloadAsFolder={handleDownloadAsFolder}
                onDownloadAsZip={handleDownloadAsZip}
                hasFileSystemAccess={hasFileSystemAccess}
                isDownloading={isDownloading}
                hasContent={hasContent}
                onPresetsChanged={handlePresetsChanged}
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0 border-t border-border/30">
            <div className="p-4">
              {hasContent ? (
                <div className="space-y-1">
                  {memoizedFileSystem.map((item) => (
                    <MobileFileSystemItem
                      key={`${item.id}-${item.name}-${item.children?.length || 0}`}
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
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <Folder className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Ready to Build</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Start by loading a preset above or add your first folder to begin building your structure.
                  </p>
                  <div className="text-xs text-muted-foreground/60 bg-muted/20 rounded-lg p-3 max-w-xs mx-auto">
                    💡 Try the "Next.js App" preset to see how it works
                  </div>
                </div>
              )}
            </div>

            {/* Preset Management Row at bottom */}
            <div className="px-4 pb-3 border-t border-border/20 bg-muted/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">PRESET MANAGEMENT</span>
                  <Separator className="flex-1" />
                </div>
                <div className="flex items-center justify-center w-full">
                  <ActionButtons
                    canUndo={false}
                    onUndo={() => {}}
                    onDownloadAsFolder={() => {}}
                    onDownloadAsZip={() => {}}
                    hasFileSystemAccess={false}
                    isDownloading={false}
                    hasContent={hasContent}
                    onPresetsChanged={handlePresetsChanged}
                    onSavePreset={handleSavePreset}
                    showOnlyPresetActions={true}
                  />
                </div>
              </div>
            </div>

            {/* Instructions at bottom */}
            <div className="px-4 pb-3 border-t border-border/20 bg-muted/20">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                {device.isMobile || device.isTablet ? (
                  <>
                    <strong>Tap</strong> folders to expand • <strong>Long press</strong> to rename • Use{" "}
                    <strong>menu</strong> for actions
                  </>
                ) : (
                  <>
                    <strong>Click</strong> to expand • <strong>Double-click</strong> to rename • <strong>Hover</strong>{" "}
                    for actions
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Structure Outline */}
        <StructureOutline fileSystem={memoizedFileSystem} />
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
