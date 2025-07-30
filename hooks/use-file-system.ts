import { useState, useCallback } from "react"
import { FileSystemItem, HistoryState } from "@/types/folder"
import { 
  sortItems, 
  deepClone, 
  updateItem, 
  addToParent, 
  deleteItem, 
  toggleExpanded,
  findItemAndParent,
  deepCopyItem,
  generateIncrementedName
} from "@/lib/folder-utils"

export const useFileSystem = () => {
  const initialFileSystem: FileSystemItem[] = [
    { id: "root", name: "root", type: "folder", children: [], expanded: true }
  ]

  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(initialFileSystem)
  const [history, setHistory] = useState<HistoryState[]>([
    { fileSystem: deepClone(initialFileSystem), timestamp: Date.now(), action: "Initial state" },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add to history function
  const addToHistory = useCallback(
    (newFileSystem: FileSystemItem[], action: string) => {
      // Remove expansion states before storing in history
      const stripExpansionStates = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          const { expanded, ...itemWithoutExpansion } = item
          return {
            ...itemWithoutExpansion,
            children: item.children ? stripExpansionStates(item.children) : item.children,
          }
        })
      }

      const newHistoryState: HistoryState = {
        fileSystem: deepClone(stripExpansionStates(newFileSystem)),
        timestamp: Date.now(),
        action,
      }

      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHistoryState)

      // Limit history to 50 states to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setHistoryIndex(historyIndex + 1)
      }

      setHistory(newHistory)
    },
    [history, historyIndex],
  )

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      // Get current expansion states before undoing
      const getCurrentExpansionStates = (items: FileSystemItem[]): Map<string, boolean> => {
        const expansionMap = new Map<string, boolean>()

        const traverse = (items: FileSystemItem[]) => {
          items.forEach((item) => {
            if (item.type === "folder" && item.expanded !== undefined) {
              expansionMap.set(item.id, item.expanded)
            }
            if (item.children) {
              traverse(item.children)
            }
          })
        }

        traverse(items)
        return expansionMap
      }

      // Apply expansion states to restored structure
      const applyExpansionStates = (items: FileSystemItem[], expansionMap: Map<string, boolean>): FileSystemItem[] => {
        return items.map((item) => {
          const restoredItem = { ...item }

          if (item.type === "folder") {
            // Preserve expansion state if it exists, otherwise default to false
            restoredItem.expanded = expansionMap.get(item.id) ?? false
          }

          if (item.children) {
            restoredItem.children = applyExpansionStates(item.children, expansionMap)
          }

          return restoredItem
        })
      }

      const currentExpansionStates = getCurrentExpansionStates(fileSystem)
      const newIndex = historyIndex - 1
      const restoredStructure = deepClone(history[newIndex].fileSystem)
      const structureWithExpansion = applyExpansionStates(restoredStructure, currentExpansionStates)

      setHistoryIndex(newIndex)
      setFileSystem(structureWithExpansion)
    }
  }, [historyIndex, history, fileSystem])

  // File system operations
  const handleRename = useCallback((itemId: string, newName: string) => {
    if (newName.trim()) {
      const newFileSystem = updateItem(fileSystem, itemId, { name: newName.trim() })
      setFileSystem(newFileSystem)
      addToHistory(newFileSystem, `Renamed item to "${newName.trim()}"`)
    }
  }, [fileSystem, addToHistory])

  const handleDelete = useCallback((id: string) => {
    const newFileSystem = deleteItem(fileSystem, id)
    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, "Deleted item")
  }, [fileSystem, addToHistory])

  const handleDuplicate = useCallback((id: string) => {
    const result = findItemAndParent(fileSystem, id)
    if (!result) return

    const { item, parentId, siblings } = result
    const existingNames = siblings.map((sibling) => sibling.name)
    const newName = generateIncrementedName(item.name, existingNames)

    // Deep copy the entire item structure
    const duplicatedItem = deepCopyItem(item)
    // Update only the root item's name with the incremented version
    duplicatedItem.name = newName

    let newFileSystem: FileSystemItem[]
    if (parentId) {
      newFileSystem = addToParent(fileSystem, parentId, duplicatedItem)
    } else {
      // Duplicating root item
      newFileSystem = sortItems([...fileSystem, duplicatedItem])
    }

    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Duplicated "${item.name}" as "${newName}"`)
  }, [fileSystem, addToHistory])

  const handleToggleExpanded = useCallback((id: string) => {
    const newFileSystem = toggleExpanded(fileSystem, id)
    setFileSystem(newFileSystem)
    // Don't add expand/collapse to history as it's not a structural change
  }, [fileSystem])

  const handleAddItem = useCallback((parentId: string, type: "file" | "folder", name: string) => {
    if (!name.trim()) return
    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      children: type === "folder" ? [] : undefined,
      expanded: false,
    }
    const newFileSystem = addToParent(fileSystem, parentId, newItem)
    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Added ${type} "${name.trim()}"`)
  }, [fileSystem, addToHistory])

  const loadPresetStructure = useCallback((presetStructure: any[], rootName: string) => {
    const assignIds = (items: any[]): FileSystemItem[] => {
      return sortItems(
        items.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          children: item.children ? assignIds(item.children) : undefined,
          expanded: false,
        })),
      )
    }

    const newFileSystem = [
      {
        id: "root",
        name: rootName,
        type: "folder" as const,
        children: assignIds(presetStructure),
        expanded: true,
      },
    ]

    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Loaded preset structure`)
  }, [addToHistory])

  return {
    fileSystem,
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    handleUndo,
    handleRename,
    handleDelete,
    handleDuplicate,
    handleToggleExpanded,
    handleAddItem,
    loadPresetStructure,
  }
} 