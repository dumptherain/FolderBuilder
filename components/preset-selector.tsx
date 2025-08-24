"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Sparkles, Trash2, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPresets } from "@/lib/preset-loader"
import { deleteTemporaryPreset } from "@/lib/temporary-preset-manager"
import { useToast } from "@/hooks/use-toast"
import type { FolderPreset } from "@/types/folder"

interface PresetSelectorProps {
  onPresetSelect: (preset: FolderPreset) => void
  refreshTrigger?: number // Add this to force refresh from parent
}

export function PresetSelector({ onPresetSelect, refreshTrigger }: PresetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("")
  const [presets, setPresets] = useState<Record<string, FolderPreset[]>>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadAllPresets = async () => {
    try {
      setLoading(true)

      // Load all presets (built-in + temporary)
      const allPresets = await getAllPresets()
      setPresets(allPresets)
    } catch (error) {
      console.error("Failed to load presets:", error)
      setPresets({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllPresets()
  }, [refreshTrigger]) // Refresh when trigger changes

  const handlePresetSelect = (presetValue: string) => {
    // Find the preset across all categories
    let foundPreset: FolderPreset | null = null

    for (const categoryPresets of Object.values(presets)) {
      if (Array.isArray(categoryPresets)) {
        foundPreset = categoryPresets.find((p) => p.value === presetValue) || null
        if (foundPreset) break
      }
    }

    if (foundPreset) {
      onPresetSelect(foundPreset)
      setSelectedPreset(presetValue)
      setOpen(false)
    }
  }

  const handleDeleteTemporaryPreset = async (presetValue: string, event: React.MouseEvent) => {
    event.stopPropagation()

    try {
      deleteTemporaryPreset(presetValue)
      await loadAllPresets() // Reload presets

      toast({
        title: "Preset Deleted",
        description: "Temporary preset has been removed.",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete preset. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isTemporaryPreset = (categoryName: string) => {
    return categoryName.includes("(Temporary)")
  }

  const getCategoryIcon = (categoryName: string) => {
    if (isTemporaryPreset(categoryName)) {
      return <Clock className="w-3 h-3 text-blue-500" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-full h-8 bg-muted/50 rounded animate-pulse" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent border-border/50 h-8 text-xs"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500/70" />
              <span className="hidden sm:inline">Load Preset</span>
              <span className="sm:hidden">Preset</span>
            </div>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-[calc(var(--radix-popover-trigger-width)+200px)] max-w-[500px] p-0 border-border/50" align="start">
          <Command>
            <CommandInput placeholder="Search presets..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty className="text-xs">No preset found.</CommandEmpty>
              {Object.entries(presets).map(([category, categoryPresets]) => {
                if (!Array.isArray(categoryPresets) || categoryPresets.length === 0) {
                  return null
                }

                return (
                  <CommandGroup
                    key={category}
                    heading={
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(category)}
                        {category}
                      </div>
                    }
                  >
                    {categoryPresets.map((preset) => (
                      <CommandItem
                        key={preset.value}
                        value={preset.value}
                        onSelect={handlePresetSelect}
                        className="text-xs flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5",
                              selectedPreset === preset.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div>
                            <div className="font-medium">{preset.label}</div>
                            {preset.description && (
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {preset.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {isTemporaryPreset(category) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteTemporaryPreset(preset.value, e)}
                            title="Delete temporary preset"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadAllPresets} title="Refresh presets">
        <RefreshCw className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
