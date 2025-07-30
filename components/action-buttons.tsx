"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Undo2, Redo2, Save, FolderDown, FileArchive, Loader2 } from "lucide-react"
import { PresetImportExportButtons } from "@/components/preset-import-export-buttons"

interface ActionButtonsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onDownloadAsFolder?: () => void
  onDownloadAsZip?: () => void
  hasFileSystemAccess?: boolean
  isDownloading?: boolean
  hasContent: boolean
  onPresetsChanged: () => void
  onSavePreset?: () => void
  showOnlyPresetActions?: boolean
  showOnlyExportActions?: boolean
  showOnlyUndoRedo?: boolean
}

export function ActionButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDownloadAsFolder,
  onDownloadAsZip,
  hasFileSystemAccess,
  isDownloading,
  hasContent,
  onPresetsChanged,
  onSavePreset,
  showOnlyPresetActions = false,
  showOnlyExportActions = false,
  showOnlyUndoRedo = false,
}: ActionButtonsProps) {
  if (showOnlyPresetActions) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <PresetImportExportButtons onPresetsChanged={onPresetsChanged} />
        </div>
        {onSavePreset && (
          <div className="flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onSavePreset}
              disabled={!hasContent}
              className="w-full h-8 text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950/20 bg-transparent"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (showOnlyExportActions) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadAsFolder}
          disabled={!hasContent || !hasFileSystemAccess || isDownloading}
          className="h-9 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950/20 bg-transparent"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderDown className="w-4 h-4 mr-2" />}
          Folder
          {!hasFileSystemAccess && (
            <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
              N/A
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadAsZip}
          disabled={!hasContent}
          className="h-9 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 dark:hover:bg-purple-950/20 bg-transparent"
        >
          <FileArchive className="w-4 h-4 mr-2" />
          ZIP
        </Button>
      </div>
    )
  }

  if (showOnlyUndoRedo) {
    return (
      <div className="space-y-3">
        <span className="text-sm font-medium">Actions</span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-9 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 dark:hover:bg-orange-950/20 bg-transparent"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-9 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950/20 bg-transparent"
          >
            <Redo2 className="w-4 h-4 mr-2" />
            Redo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-9 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 dark:hover:bg-orange-950/20 bg-transparent"
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-9 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950/20 bg-transparent"
        >
          <Redo2 className="w-4 h-4 mr-2" />
          Redo
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">EXPORT</span>
        <Separator className="flex-1" />
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadAsFolder}
          disabled={!hasContent || !hasFileSystemAccess || isDownloading}
          className="h-9 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950/20 bg-transparent"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderDown className="w-4 h-4 mr-2" />}
          Folder
          {!hasFileSystemAccess && (
            <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
              N/A
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadAsZip}
          disabled={!hasContent}
          className="h-9 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 dark:hover:bg-purple-950/20 bg-transparent"
        >
          <FileArchive className="w-4 h-4 mr-2" />
          ZIP
        </Button>
      </div>
    </div>
  )
}
