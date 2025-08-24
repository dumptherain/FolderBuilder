import type { FolderPreset, PresetCategory } from "@/types/folder"
import { getTemporaryPresets, initializeTemporaryPresets } from "./temporary-preset-manager"
import { parseIndentedPreset } from "@/lib/preset-text"

// A map of preset keys to dynamic import functions.
// Using relative paths to ensure compatibility with different environments
// and to resolve the module loading error.
const presetModules: Record<string, () => Promise<any>> = {
  empty: () => import("../data/presets/empty.preset.txt"),
  "react-app": () => import("../data/presets/react-app.preset.txt"),
  "nextjs-app": () => import("../data/presets/nextjs-app.preset.txt"),
  "node-api": () => import("../data/presets/node-api.preset.txt"),
  "video-production": () => import("../data/presets/video-production-copy.preset.txt"),
  cgi: () => import("../data/presets/cgi.preset.txt"),
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
    const raw = (presetModule.default || presetModule) as any

    // If importing a raw text asset (from .preset.txt), it's a string
    if (typeof raw === "string") {
      const parsed = parseIndentedPreset(raw)
      return parsed
    }

    // If a compact indented text representation is present, parse and build structure from it
    const textField: string | string[] | undefined = (raw as any)?.text
    const textAsString = Array.isArray(textField)
      ? textField.join("\n")
      : typeof textField === "string"
        ? textField
        : undefined

    if (typeof textAsString === "string" && textAsString.trim().length > 0) {
      try {
        const parsed = parseIndentedPreset(textAsString)
        const merged: FolderPreset = {
          value: raw.value ?? parsed.value,
          label: raw.label ?? parsed.label,
          category: raw.category ?? parsed.category,
          description: raw.description ?? parsed.description,
          rootName: raw.rootName ?? parsed.rootName,
          structure: parsed.structure,
        }
        return merged
      } catch (e) {
        console.warn(`Failed to parse text preset for ${presetValue}, falling back to JSON structure.`)
      }
    }

    // Fallback to regular JSON structure
    return raw as FolderPreset
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
export const getAllPresets = async (): Promise<Record<string, FolderPreset[]>> => {
  const presets: Record<string, FolderPreset[]> = {}

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

    // Sort presets within each category to prioritize CGI preset
    Object.keys(presets).forEach((category) => {
      if (presets[category]) {
        presets[category].sort((a: FolderPreset, b: FolderPreset) => {
          // Put CGI preset first
          if (a.value === "cgi") return -1
          if (b.value === "cgi") return 1
          // Then sort alphabetically by label
          return a.label.localeCompare(b.label)
        })
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
