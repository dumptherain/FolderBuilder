import type { FolderPreset } from "@/types/folder"

// Temporary preset storage key
const TEMP_PRESETS_KEY = "temporary-presets"

// Get all temporary presets from localStorage
export const getTemporaryPresets = (): Record<string, FolderPreset> => {
  try {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem(TEMP_PRESETS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error("Failed to load temporary presets:", error)
    return {}
  }
}

// Save a temporary preset
export const saveTemporaryPreset = (preset: FolderPreset): void => {
  try {
    if (typeof window === "undefined") return

    const existingPresets = getTemporaryPresets()
    const updatedPresets = {
      ...existingPresets,
      [preset.value]: preset,
    }

    localStorage.setItem(TEMP_PRESETS_KEY, JSON.stringify(updatedPresets))
  } catch (error) {
    console.error("Failed to save temporary preset:", error)
    throw new Error("Failed to save temporary preset")
  }
}

// Delete a temporary preset
export const deleteTemporaryPreset = (presetValue: string): void => {
  try {
    if (typeof window === "undefined") return

    const existingPresets = getTemporaryPresets()
    delete existingPresets[presetValue]
    localStorage.setItem(TEMP_PRESETS_KEY, JSON.stringify(existingPresets))
  } catch (error) {
    console.error("Failed to delete temporary preset:", error)
    throw new Error("Failed to delete temporary preset")
  }
}

// Load example temporary preset (for demonstration)
export const loadExampleTemporaryPreset = async (): Promise<FolderPreset | null> => {
  try {
    // Check if we already have temporary presets
    const existing = getTemporaryPresets()
    if (Object.keys(existing).length > 0) {
      return null // Don't load example if user has their own presets
    }

    // Create a basic example preset
    const examplePreset: FolderPreset = {
      value: "temp-example",
      label: "Example Temporary",
      description: "A sample temporary preset to get you started",
      category: "Temporary",
      rootName: "example-project",
      structure: [
        {
          id: "1",
          name: "src",
          type: "folder",
          children: [
            { id: "2", name: "components", type: "folder", children: [] },
            { id: "3", name: "utils", type: "folder", children: [] },
            { id: "4", name: "index.js", type: "file", children: [] },
          ],
        },
        {
          id: "5",
          name: "docs",
          type: "folder",
          children: [{ id: "6", name: "README.md", type: "file", children: [] }],
        },
      ],
    }

    // Save it as a temporary preset
    saveTemporaryPreset(examplePreset)
    return examplePreset
  } catch (error) {
    console.error("Failed to load example temporary preset:", error)
    return null
  }
}

// Initialize temporary presets (load example if none exist)
export const initializeTemporaryPresets = async (): Promise<void> => {
  try {
    await loadExampleTemporaryPreset()
  } catch (error) {
    console.error("Failed to initialize temporary presets:", error)
  }
}

// Generate unique preset value for temporary presets
export const generateTemporaryPresetValue = (label: string): string => {
  const existingPresets = getTemporaryPresets()
  const existingValues = Object.keys(existingPresets)

  const baseValue = `temp-${label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim()}`

  if (!existingValues.includes(baseValue)) {
    return baseValue
  }

  let counter = 2
  let newValue = `${baseValue}-${counter}`

  while (existingValues.includes(newValue)) {
    counter++
    newValue = `${baseValue}-${counter}`
  }

  return newValue
}

// Clear all temporary presets
export const clearTemporaryPresets = (): void => {
  try {
    if (typeof window === "undefined") return
    localStorage.removeItem(TEMP_PRESETS_KEY)
  } catch (error) {
    console.error("Failed to clear temporary presets:", error)
  }
}

// Export temporary presets as JSON string
export const exportTemporaryPresets = (): string => {
  const presets = getTemporaryPresets()
  return JSON.stringify(presets, null, 2)
}

// Download temporary presets as JSON file
export const downloadTemporaryPresets = (): number => {
  try {
    const presets = getTemporaryPresets()
    const presetsCount = Object.keys(presets).length

    if (presetsCount === 0) {
      throw new Error("No temporary presets to download")
    }

    const jsonString = JSON.stringify(presets, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `temporary-presets-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    return presetsCount
  } catch (error) {
    console.error("Failed to download temporary presets:", error)
    throw error
  }
}

// Import temporary presets from JSON string
export const importTemporaryPresets = (jsonData: string, mergeMode = false): number => {
  try {
    const importedPresets = JSON.parse(jsonData)

    // Validate the structure
    for (const [key, preset] of Object.entries(importedPresets)) {
      if (
        typeof preset !== "object" ||
        !preset ||
        typeof (preset as any).value !== "string" ||
        typeof (preset as any).label !== "string" ||
        typeof (preset as any).category !== "string" ||
        !Array.isArray((preset as any).structure)
      ) {
        throw new Error(`Invalid preset structure for key: ${key}`)
      }
    }

    if (typeof window === "undefined") return 0

    let finalPresets = importedPresets

    if (mergeMode) {
      // Merge with existing presets
      const existingPresets = getTemporaryPresets()
      finalPresets = { ...existingPresets, ...importedPresets }
    }

    localStorage.setItem(TEMP_PRESETS_KEY, JSON.stringify(finalPresets))
    return Object.keys(importedPresets).length
  } catch (error) {
    console.error("Failed to import temporary presets:", error)
    throw new Error("Failed to import temporary presets: Invalid JSON format")
  }
}

// Upload and import temporary presets from file
export const uploadTemporaryPresets = (file: File, mergeMode = false): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string
        const importedCount = importTemporaryPresets(jsonData, mergeMode)
        resolve(importedCount)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

// Get temporary presets statistics
export const getTemporaryPresetsStats = () => {
  const presets = getTemporaryPresets()
  const count = Object.keys(presets).length
  const categories = new Set(Object.values(presets).map((p) => p.category))

  return {
    count,
    categories: Array.from(categories),
    isEmpty: count === 0,
  }
}
