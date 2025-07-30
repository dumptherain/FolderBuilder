import type { FolderPreset, FolderPresetCategory } from "@/types/folder"
import { getTemporaryPresets, initializeTemporaryPresets } from "./temporary-preset-manager"

// A map of preset keys to dynamic import functions.
// Using relative paths to ensure compatibility with different environments
// and to resolve the module loading error.
const presetModules: Record<string, () => Promise<any>> = {
  empty: () => import("../data/presets/empty.json"),
  "react-app": () => import("../data/presets/react-app.json"),
  "nextjs-app": () => import("../data/presets/nextjs-app.json"),
  "node-api": () => import("../data/presets/node-api.json"),
  "video-production": () => import("../data/presets/video-production.json"),
  cgi: () => import("../data/presets/cgi.json"),
}

/**
 * Loads a single preset configuration by its value (key).
 * This function dynamically imports the preset's JSON file.
 * @param presetValue The unique identifier for the preset.
 * @returns A promise that resolves to the FolderPreset object or null if not found.
 */
export const loadPreset = async (presetValue: string): Promise<FolderPreset | null> => {
  try {
    // First, check if it's a temporary preset stored in localStorage.
    const tempPresets = getTemporaryPresets()
    if (tempPresets[presetValue]) {
      return tempPresets[presetValue]
    }

    // Then, check the built-in presets.
    const moduleLoader = presetModules[presetValue]
    if (!moduleLoader) {
      console.warn(`Preset "${presetValue}" not found in built-in presets.`)
      return null
    }

    const presetModule = await moduleLoader()
    // The JSON module is typically imported with a `default` property.
    const preset = presetModule.default || presetModule
    return preset
  } catch (error) {
    console.error(`Failed to load preset "${presetValue}":`, error)
    return null
  }
}

/**
 * Loads all available presets (both built-in and temporary) and groups them by category.
 * @returns A promise that resolves to an object where keys are category names
 *          and values are arrays of FolderPreset objects.
 */
export const getAllPresets = async (): Promise<FolderPresetCategory> => {
  const presets: FolderPresetCategory = {}

  try {
    // Ensure temporary presets from localStorage are initialized.
    await initializeTemporaryPresets()

    // Load all built-in presets concurrently.
    const presetPromises = Object.keys(presetModules).map((key) => loadPreset(key))
    const loadedPresets = await Promise.all(presetPromises)

    // Group built-in presets by their category.
    loadedPresets.forEach((preset) => {
      if (preset) {
        const category = preset.category || "General" // Use "General" as a fallback category.
        if (!presets[category]) {
          presets[category] = []
        }
        presets[category].push(preset)
      }
    })

    // Load and group temporary presets.
    const tempPresets = getTemporaryPresets()
    const tempPresetsList: FolderPreset[] = Object.values(tempPresets)

    if (tempPresetsList.length > 0) {
      tempPresetsList.forEach((preset) => {
        const category = `${preset.category || "General"} (Temporary)`
        if (!presets[category]) {
          presets[category] = []
        }
        presets[category].push(preset)
      })
    }

    return presets
  } catch (error) {
    console.error("Failed to load all presets:", error)
    return {}
  }
}

/**
 * Retrieves a preset by its value.
 * @param value The unique identifier for the preset.
 * @returns A promise that resolves to the FolderPreset object or null if not found.
 */
export const getPresetByValue = async (value: string): Promise<FolderPreset | null> => {
  return loadPreset(value)
}

/**
 * Retrieves all presets belonging to a specific category.
 * @param category The name of the category.
 * @returns A promise that resolves to an array of FolderPreset objects.
 */
export const getPresetsByCategory = async (category: string): Promise<FolderPreset[]> => {
  const allPresets = await getAllPresets()
  return allPresets[category] || []
}

/**
 * Retrieves only the temporary presets.
 * @returns An array of temporary FolderPreset objects.
 */
export const getTemporaryPresetsForSelector = (): FolderPreset[] => {
  const tempPresets = getTemporaryPresets()
  return Object.values(tempPresets)
}
