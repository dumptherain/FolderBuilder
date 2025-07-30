import type { FolderPreset, FolderPresetCategory } from "@/types/folder"
import { getTemporaryPresets, initializeTemporaryPresets } from "./temporary-preset-manager"

// Import all presets dynamically
const presetModules = {
  empty: () => import("@/data/presets/empty.json"),
  "react-app": () => import("@/data/presets/react-app.json"),
  "nextjs-app": () => import("@/data/presets/nextjs-app.json"),
  "node-api": () => import("@/data/presets/node-api.json"),
  "video-production": () => import("@/data/presets/video-production.json"),
}

export const loadPreset = async (presetValue: string): Promise<FolderPreset | null> => {
  try {
    // First check if it's a temporary preset
    const tempPresets = getTemporaryPresets()
    if (tempPresets[presetValue]) {
      return tempPresets[presetValue]
    }

    // Then check built-in presets
    const moduleLoader = presetModules[presetValue as keyof typeof presetModules]
    if (!moduleLoader) {
      console.warn(`Preset "${presetValue}" not found`)
      return null
    }

    const preset = await moduleLoader()
    return preset.default || preset
  } catch (error) {
    console.error(`Failed to load preset "${presetValue}":`, error)
    return null
  }
}

export const getAllPresets = async (): Promise<FolderPresetCategory> => {
  const presets: FolderPresetCategory = {}

  try {
    // Initialize temporary presets if needed
    await initializeTemporaryPresets()

    // Load built-in presets
    const presetPromises = Object.keys(presetModules).map(async (key) => {
      const preset = await loadPreset(key)
      return preset
    })

    const loadedPresets = await Promise.all(presetPromises)

    // Group built-in presets by category
    loadedPresets.forEach((preset) => {
      if (preset) {
        const category = preset.category
        if (!presets[category]) {
          presets[category] = []
        }
        presets[category].push(preset)
      }
    })

    // Load temporary presets
    const tempPresets = getTemporaryPresets()
    const tempPresetsList: FolderPreset[] = Object.values(tempPresets)

    if (tempPresetsList.length > 0) {
      // Group temporary presets by category
      tempPresetsList.forEach((preset) => {
        const category = `${preset.category} (Temporary)`
        if (!presets[category]) {
          presets[category] = []
        }
        presets[category].push(preset)
      })
    }

    return presets
  } catch (error) {
    console.error("Failed to load presets:", error)
    return {}
  }
}

export const getPresetByValue = async (value: string): Promise<FolderPreset | null> => {
  return loadPreset(value)
}

export const getPresetsByCategory = async (category: string): Promise<FolderPreset[]> => {
  const allPresets = await getAllPresets()
  return allPresets[category] || []
}

// Get temporary presets specifically
export const getTemporaryPresetsForSelector = (): FolderPreset[] => {
  const tempPresets = getTemporaryPresets()
  return Object.values(tempPresets)
}
