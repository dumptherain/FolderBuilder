"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPresets } from "@/lib/preset-loader"
import type { FolderPreset } from "@/types/folder"

interface PresetSelectorProps {
  onPresetSelect: (preset: FolderPreset) => void
}

export function PresetSelector({ onPresetSelect }: PresetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("")
  const [presets, setPresets] = useState<Record<string, FolderPreset[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true)
        const allPresets = await getAllPresets()
        setPresets(allPresets)
      } catch (error) {
        console.error("Failed to load presets:", error)
        setPresets({})
      } finally {
        setLoading(false)
      }
    }

    loadPresets()
  }, [])

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

  if (loading) {
    return <div className="w-full h-8 bg-muted/50 rounded animate-pulse" />
  }

  return (
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
      <PopoverContent className="w-[280px] p-0 border-border/50">
        <Command>
          <CommandInput placeholder="Search presets..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs">No preset found.</CommandEmpty>
            {Object.entries(presets).map(([category, categoryPresets]) => {
              if (!Array.isArray(categoryPresets) || categoryPresets.length === 0) {
                return null
              }

              return (
                <CommandGroup key={category} heading={category}>
                  {categoryPresets.map((preset) => (
                    <CommandItem
                      key={preset.value}
                      value={preset.value}
                      onSelect={handlePresetSelect}
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          selectedPreset === preset.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {preset.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
