"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Clock } from "lucide-react"
import type { FileSystemItem } from "@/types/folder"
import { convertToPresetFormat } from "@/lib/preset-utils"
import { saveTemporaryPreset, generateTemporaryPresetValue, getTemporaryPresets } from "@/lib/temporary-preset-manager"
import { useToast } from "@/hooks/use-toast"

interface SavePresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileSystem: FileSystemItem[]
  onPresetSaved?: () => void // Callback to refresh preset selector
}

const PRESET_CATEGORIES = [
  "Web Development",
  "Backend Development",
  "Mobile Development",
  "Creative & Media",
  "Data Science",
  "DevOps",
  "Temporary",
  "Custom",
]

export function SavePresetDialog({ open, onOpenChange, fileSystem, onPresetSaved }: SavePresetDialogProps) {
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Temporary")
  const [rootName, setRootName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!label.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a preset name.",
        variant: "destructive",
      })
      return
    }

    if (!rootName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a root folder name.",
        variant: "destructive",
      })
      return
    }

    // Check if there's any content to save
    const hasContent = fileSystem.some((rootItem) => rootItem?.children?.length > 0)
    if (!hasContent) {
      toast({
        title: "Empty Structure",
        description: "Cannot save an empty folder structure as a preset.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Generate unique value for temporary preset
      const value = generateTemporaryPresetValue(label.trim())

      // Convert file system to preset format
      const structure = convertToPresetFormat(fileSystem)

      // Create preset object
      const preset = {
        value,
        label: label.trim(),
        category: category,
        description: description.trim() || `Temporary preset: ${label.trim()}`,
        rootName: rootName.trim(),
        structure,
      }

      // Save to temporary storage
      saveTemporaryPreset(preset)

      toast({
        title: "Preset Saved!",
        description: `"${label.trim()}" has been saved to your temporary presets.`,
      })

      // Notify parent component to refresh
      onPresetSaved?.()

      // Reset form and close dialog
      setLabel("")
      setDescription("")
      setCategory("Temporary")
      setRootName("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save preset:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save preset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(newOpen)
      if (!newOpen) {
        // Reset form when closing
        setLabel("")
        setDescription("")
        setCategory("Temporary")
        setRootName("")
      }
    }
  }

  // Set default root name when dialog opens
  const handleDialogOpen = () => {
    if (open && !rootName) {
      if (fileSystem.length === 1 && fileSystem[0]?.name) {
        setRootName(fileSystem[0].name)
      } else if (fileSystem.length > 1) {
        setRootName("multi-root-structure")
      } else {
        setRootName("my-project")
      }
    }
  }

  // Get count of existing temporary presets
  const tempPresetCount = Object.keys(getTemporaryPresets()).length

  // Calculate total items across all root folders
  const totalItems = fileSystem.reduce((total, rootItem) => {
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
    return total + (rootItem?.children ? countItems(rootItem.children) : 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={handleDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save as Temporary Preset
          </DialogTitle>
          <DialogDescription>
            Save your current folder structure as a temporary preset. It will be stored locally and available in the
            preset selector.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Storage info */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium">Temporary Storage</div>
              <div className="text-xs opacity-80">
                Saved locally • {tempPresetCount} preset{tempPresetCount !== 1 ? "s" : ""} stored
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="preset-name">Preset Name *</Label>
            <Input
              id="preset-name"
              placeholder="e.g., My React Project"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="root-name">Root Folder Name *</Label>
            <Input
              id="root-name"
              placeholder="e.g., my-project"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                    {cat === "Temporary" && " (Recommended)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this preset is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>

          {totalItems > 0 && (
            <div className="rounded-md bg-muted/30 p-3">
              <div className="text-sm font-medium mb-2">Preview:</div>
              <div className="text-xs text-muted-foreground">
                📁 {rootName || "my-project"} ({totalItems} item{totalItems !== 1 ? "s" : ""})
                {fileSystem.length > 1 && (
                  <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Multiple root folders detected - will be saved as multi-root structure
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save to Temporary
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
