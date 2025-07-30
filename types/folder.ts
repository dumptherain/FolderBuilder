export interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileSystemItem[]
  expanded?: boolean
}

export interface HistoryState {
  fileSystem: FileSystemItem[]
  timestamp: number
  action: string
}

export interface FolderPreset {
  value: string
  label: string
  rootName: string
  structure: Omit<FileSystemItem, 'id' | 'expanded'>[]
}

export interface FolderPresetCategory {
  [category: string]: FolderPreset[]
}
