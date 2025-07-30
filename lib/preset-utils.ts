import type { FileSystemItem } from "@/types/folder"

// Convert file system to preset format
export const convertToPresetFormat = (fileSystem: FileSystemItem[]): any[] => {
  const convertItem = (item: FileSystemItem): any => {
    const converted: any = {
      name: item.name,
      type: item.type,
    }

    if (item.children && item.children.length > 0) {
      converted.children = item.children.map(convertItem)
    } else if (item.type === "folder") {
      converted.children = []
    }

    return converted
  }

  // Handle multiple root folders
  if (fileSystem.length === 1 && fileSystem[0]?.children) {
    // Single root folder - convert its children
    return fileSystem[0].children.map(convertItem)
  } else {
    // Multiple root folders - convert each root folder
    return fileSystem.map(convertItem)
  }
}

// Save preset to localStorage
export const savePresetToStorage = (preset: {
  value: string
  label: string
  category: string
  description: string
  rootName: string
  structure: any[]
}): void => {
  try {
    const existingPresets = getCustomPresets()
    const updatedPresets = {
      ...existingPresets,
      [preset.value]: preset,
    }
    localStorage.setItem("custom-presets", JSON.stringify(updatedPresets))
  } catch (error) {
    console.error("Failed to save preset:", error)
    throw new Error("Failed to save preset to storage")
  }
}

// Get custom presets from localStorage
export const getCustomPresets = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem("custom-presets")
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error("Failed to load custom presets:", error)
    return {}
  }
}

// Delete custom preset
export const deleteCustomPreset = (presetValue: string): void => {
  try {
    const existingPresets = getCustomPresets()
    delete existingPresets[presetValue]
    localStorage.setItem("custom-presets", JSON.stringify(existingPresets))
  } catch (error) {
    console.error("Failed to delete preset:", error)
    throw new Error("Failed to delete preset")
  }
}

// Generate unique preset value
export const generatePresetValue = (label: string, existingValues: string[]): string => {
  const baseValue = label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim()

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
