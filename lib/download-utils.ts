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
          } else {
            // Create .gitkeep for empty folders
            const fileHandle = await folderHandle.getFileHandle(".gitkeep", { create: true })
            const writable = await fileHandle.createWritable()
            await writable.write("")
            await writable.close()
          }
        } else {
          // Create file
          const fileHandle = await parentHandle.getFileHandle(item.name, { create: true })
          const writable = await fileHandle.createWritable()
          await writable.write("")
          await writable.close()
        }
      }
    }

    // Handle multiple root folders
    if (fileSystem.length === 1 && fileSystem[0]?.children) {
      // Single root folder - create its children directly
      await createStructure(fileSystem[0].children, dirHandle)
    } else {
      // Multiple root folders - create each root folder
      for (const rootItem of fileSystem) {
        if (rootItem.type === "folder") {
          const rootFolderHandle = await dirHandle.getDirectoryHandle(rootItem.name, { create: true })
          if (rootItem.children && rootItem.children.length > 0) {
            await createStructure(rootItem.children, rootFolderHandle)
          } else {
            // Create .gitkeep for empty root folders
            const fileHandle = await rootFolderHandle.getFileHandle(".gitkeep", { create: true })
            const writable = await fileHandle.createWritable()
            await writable.write("")
            await writable.close()
          }
        }
      }
    }

    alert("Folder structure created successfully!")
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

    const addToZip = (items: FileSystemItem[], currentPath = "") => {
      items.forEach((item) => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name

        if (item.type === "folder") {
          zip.folder(itemPath)
          if (item.children && item.children.length > 0) {
            addToZip(item.children, itemPath)
          } else {
            zip.file(`${itemPath}/.gitkeep`, "")
          }
        } else {
          zip.file(itemPath, "")
        }
      })
    }

    // Handle multiple root folders
    if (fileSystem.length === 1 && fileSystem[0]?.children) {
      // Single root folder - add its children directly
      addToZip(fileSystem[0].children)
    } else {
      // Multiple root folders - add each root folder
      fileSystem.forEach((rootItem) => {
        if (rootItem.type === "folder") {
          zip.folder(rootItem.name)
          if (rootItem.children && rootItem.children.length > 0) {
            addToZip(rootItem.children, rootItem.name)
          } else {
            zip.file(`${rootItem.name}/.gitkeep`, "")
          }
        }
      })
    }

    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = url

    // Generate filename based on structure
    let filename = "folder-structure"
    if (fileSystem.length === 1 && fileSystem[0]?.name) {
      filename = fileSystem[0].name
    } else if (fileSystem.length > 1) {
      filename = "multiple-folders"
    }

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
