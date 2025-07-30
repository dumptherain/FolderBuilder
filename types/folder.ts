export interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileSystemItem[]
  expanded?: boolean
}

export interface FolderPreset {
  value: string
  label: string
  category?: string
  description?: string
  rootName: string
  structure: Omit<FileSystemItem, "id" | "expanded">[]
}

export interface PresetCategory {
  name: string
  presets: FolderPreset[]
}
