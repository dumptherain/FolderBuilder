"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Download, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  downloadTemporaryPresets,
  uploadTemporaryPresets,
  getTemporaryPresetsStats,
} from "@/lib/temporary-preset-manager"

interface PresetImportExportButtonsProps {
  onPresetsChanged: () => void
}

export function PresetImportExportButtons({ onPresetsChanged }: PresetImportExportButtonsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const stats = getTemporaryPresetsStats()

  const handleDownload = () => {
    try {
      const count = downloadTemporaryPresets()
      toast({
        title: "Presets Downloaded",
        description: `Downloaded ${count} temporary preset${count !== 1 ? "s" : ""} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download temporary presets.",
        variant: "destructive",
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset the input
    event.target.value = ""

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid File",
        description: "Please select a JSON file.",
        variant: "destructive",
      })
      return
    }

    // Check if we have existing presets
    if (stats.count > 0) {
      setPendingFile(file)
      setShowMergeDialog(true)
    } else {
      // No existing presets, import directly
      handleImport(file, false)
    }
  }

  const handleImport = async (file: File, mergeMode: boolean) => {
    setIsUploading(true)
    try {
      const count = await uploadTemporaryPresets(file, mergeMode)
      toast({
        title: "Presets Imported",
        description: `Successfully imported ${count} preset${count !== 1 ? "s" : ""}.`,
      })
      onPresetsChanged()
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import presets.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setPendingFile(null)
      setShowMergeDialog(false)
    }
  }

  const handleMergeConfirm = (replace: boolean) => {
    if (pendingFile) {
      handleImport(pendingFile, !replace)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={stats.count === 0}
            className="w-full h-8 text-xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950/20 bg-transparent"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
            {stats.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
                {stats.count}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full h-8 text-xs hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 dark:hover:bg-cyan-950/20 bg-transparent"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 mr-1.5" />
            )}
            Import
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.preset.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Presets</AlertDialogTitle>
            <AlertDialogDescription>
              You have {stats.count} existing temporary preset{stats.count !== 1 ? "s" : ""}. How would you like to
              import the new presets?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMergeConfirm(false)} variant="outline">
              Merge (Keep Both)
            </AlertDialogAction>
            <AlertDialogAction onClick={() => handleMergeConfirm(true)} variant="destructive">
              Replace All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
