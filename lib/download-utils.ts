import type { FileSystemItem } from "@/types/folder"

// File System Access API approach (modern browsers)
export const downloadAsFolder = async (
  fileSystem: FileSystemItem[],
  setIsDownloading: (loading: boolean) => void,
): Promise<void> => {
  if (!("showDirectoryPicker" in window)) {
    alert("Your browser doesn't support direct folder creation. Please use the ZIP download instead.")
    return
  }

  try {
    setIsDownloading(true)

    // Ask user to select a directory
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
    })

    const createStructure = async (items: FileSystemItem[], parentHandle: any) => {
      for (const item of items) {
        if (item.type === "folder") {
          // Create folder
          const folderHandle = await parentHandle.getDirectoryHandle(item.name, { create: true })

          // Create children if they exist
          if (item.children && item.children.length > 0) {
            await createStructure(item.children, folderHandle)
          }
          // Empty folders are created automatically, no need for .gitkeep
        } else {
          // Create file
          const fileHandle = await parentHandle.getFileHandle(item.name, { create: true })
          const writable = await fileHandle.createWritable()
          await writable.write("")
          await writable.close()
        }
      }
    }

    // Get the root folder name
    const rootFolderName = fileSystem[0]?.name || "root"

    // Create the root folder in the selected directory
    const rootHandle = await dirHandle.getDirectoryHandle(rootFolderName, { create: true })

    // Create the structure inside the root folder
    if (fileSystem[0]?.children) {
      await createStructure(fileSystem[0].children, rootHandle)
    }

    alert(`Folder structure "${rootFolderName}" created successfully!`)
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      // User cancelled the directory picker
      return
    }
    console.error("Error creating folder structure:", error)
    alert("Error creating folder structure. Your browser might not support this feature.")
  } finally {
    setIsDownloading(false)
  }
}

// ZIP download fallback
export const downloadAsZip = async (fileSystem: FileSystemItem[]): Promise<void> => {
  try {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    const addToZip = (items: FileSystemItem[], parentZip: any) => {
      items.forEach((item) => {
        if (item.type === "folder") {
          const folder = parentZip.folder(item.name)
          if (folder && item.children && item.children.length > 0) {
            addToZip(item.children, folder)
          }
        } else {
          parentZip.file(item.name, "")
        }
      })
    }

    const rootFolderName = fileSystem[0]?.name || "root"
    const rootFolder = zip.folder(rootFolderName)

    if (rootFolder && fileSystem[0]?.children) {
      addToZip(fileSystem[0].children, rootFolder)
    }

    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = url

    // Generate filename based on structure
    const filename = fileSystem[0]?.name || "folder-structure"

    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error creating zip file:", error)
    alert("Error creating folder structure. Please try again.")
  }
}
