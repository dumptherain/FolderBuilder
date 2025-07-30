export interface FolderStructure {
  id: string
  name: string
  type: "folder" | "file"
  children?: FolderStructure[]
}
