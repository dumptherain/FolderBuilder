"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { FolderPreset, FolderPresetCategory } from "@/types/folder"
import { getAllPresets } from "@/lib/preset-loader"

interface PresetSelectorProps {
  onPresetSelect: (preset: FolderPreset) => void
}

export function PresetSelector({ onPresetSelect }: PresetSelectorProps) {
  const [presetOpen, setPresetOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("")
  const [presets, setPresets] = useState<FolderPresetCategory>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const loadedPresets = await getAllPresets()
        setPresets(loadedPresets)
      } catch (error) {
        console.error('Failed to load presets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPresets()
  }, [])

  const handlePresetSelect = (presetValue: string) => {
    // Find the selected preset
    for (const category of Object.values(presets)) {
      const preset = category.find(p => p.value === presetValue)
      if (preset) {
        onPresetSelect(preset)
        setSelectedPreset("")
        setPresetOpen(false)
        break
      }
    }
  }

  if (loading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between bg-transparent border-border/50 h-8 text-xs"
        size="sm"
        disabled
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500/70" />
          <span className="hidden sm:inline">Loading Presets...</span>
          <span className="sm:hidden">Loading...</span>
        </div>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={presetOpen} onOpenChange={setPresetOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={presetOpen}
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
            {Object.entries(presets).map(([category, categoryPresets]) => (
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
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 