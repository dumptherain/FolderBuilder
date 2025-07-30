"use client"

import { useState, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { sortItems, deepClone, findItemAndParent, generateIncrementedName, deepCopyItem } from "@/lib/folder-utils"
import type { FileSystemItem } from "@/types/folder"

interface HistoryState {
  fileSystem: FileSystemItem[]
  timestamp: number
  action: string
}

const initialFileSystem: FileSystemItem[] = [{ id: "root", name: "root", type: "folder", children: [], expanded: true }]

export function useFileSystem() {
  const { toast } = useToast()
  const [fileSystem, setFileSystem] = useLocalStorage<FileSystemItem[]>("folder-structure", initialFileSystem)
  const [history, setHistory] = useState<HistoryState[]>([
    { fileSystem: deepClone(initialFileSystem), timestamp: Date.now(), action: "Initial state" },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const ensureRootFolder = useCallback((fs: FileSystemItem[]): FileSystemItem[] => {
    if (!fs || fs.length === 0 || !fs[0] || fs[0].id !== "root" || fs[0].type !== "folder") {
      return initialFileSystem
    }
    return [fs[0]]
  }, [])

  const addToHistory = useCallback(
    (newFileSystem: FileSystemItem[], action: string) => {
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

      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHistoryState)

      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setHistoryIndex(historyIndex + 1)
      }

      setHistory(newHistory)
    },
    [history, historyIndex],
  )

  const updateFileSystem = useCallback(
    (newFileSystem: FileSystemItem[], action: string) => {
      const validatedFileSystem = ensureRootFolder(newFileSystem)
      setFileSystem(validatedFileSystem)
      addToHistory(validatedFileSystem, action)
    },
    [ensureRootFolder, addToHistory, setFileSystem],
  )

  const findItemById = useCallback((items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }, [])

  const updateItemInTree = useCallback(
    (
      items: FileSystemItem[],
      targetId: string,
      updater: (item: FileSystemItem) => FileSystemItem,
    ): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === targetId) {
          return updater(item)
        }
        if (item.children) {
          return {
            ...item,
            children: updateItemInTree(item.children, targetId, updater),
          }
        }
        return item
      })
    },
    [],
  )

  const removeItemFromTree = useCallback((items: FileSystemItem[], targetId: string): FileSystemItem[] => {
    return items
      .filter((item) => item.id !== targetId)
      .map((item) => ({
        ...item,
        children: item.children ? removeItemFromTree(item.children, targetId) : item.children,
      }))
  }, [])

  const addItemToTree = useCallback(
    (items: FileSystemItem[], parentId: string, newItem: FileSystemItem): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === parentId && item.type === "folder") {
          const updatedChildren = [...(item.children || []), newItem]
          return {
            ...item,
            children: sortItems(updatedChildren),
            expanded: true,
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addItemToTree(item.children, parentId, newItem),
          }
        }
        return item
      })
    },
    [],
  )

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1
      const targetState = history[newIndex]

      const restoreExpansionStates = (items: FileSystemItem[], currentItems: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          const currentItem = findItemById(currentItems, item.id)
          return {
            ...item,
            expanded: currentItem?.expanded ?? (item.id === "root" ? true : false),
            children: item.children ? restoreExpansionStates(item.children, currentItems) : item.children,
          }
        })
      }

      const restoredFileSystem = restoreExpansionStates(targetState.fileSystem, fileSystem)
      setFileSystem(restoredFileSystem)
      setHistoryIndex(newIndex)
    }
  }, [canUndo, historyIndex, history, fileSystem, setFileSystem, findItemById])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1
      const targetState = history[newIndex]

      const restoreExpansionStates = (items: FileSystemItem[], currentItems: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          const currentItem = findItemById(currentItems, item.id)
          return {
            ...item,
            expanded: currentItem?.expanded ?? (item.id === "root" ? true : false),
            children: item.children ? restoreExpansionStates(item.children, currentItems) : item.children,
          }
        })
      }

      const restoredFileSystem = restoreExpansionStates(targetState.fileSystem, fileSystem)
      setFileSystem(restoredFileSystem)
      setHistoryIndex(newIndex)
    }
  }, [canRedo, historyIndex, history, fileSystem, setFileSystem, findItemById])

  const handleToggleExpanded = useCallback(
    (id: string) => {
      const newFileSystem = updateItemInTree(fileSystem, id, (item) => ({
        ...item,
        expanded: !item.expanded,
      }))
      setFileSystem(newFileSystem)
    },
    [fileSystem, updateItemInTree, setFileSystem],
  )

  const handleRename = useCallback(
    (id: string, newName: string): boolean => {
      const trimmedName = newName.trim()
      if (!trimmedName) {
        toast({
          title: "Invalid Name",
          description: "Name cannot be empty.",
          variant: "destructive",
        })
        return false
      }

      const parentInfo = findItemAndParent(fileSystem, id)
      if (parentInfo) {
        const isDuplicate = parentInfo.siblings.some(
          (sibling) => sibling.id !== id && sibling.name.toLowerCase() === trimmedName.toLowerCase(),
        )

        if (isDuplicate) {
          toast({
            title: "Rename Failed",
            description: `An item named "${trimmedName}" already exists in this folder.`,
            variant: "destructive",
          })
          return false
        }
      }

      const newFileSystem = updateItemInTree(fileSystem, id, (item) => ({
        ...item,
        name: trimmedName,
      }))
      updateFileSystem(newFileSystem, `Renamed "${findItemById(fileSystem, id)?.name}" to "${trimmedName}"`)
      return true
    },
    [fileSystem, updateItemInTree, updateFileSystem, findItemById, toast],
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (id === "root") return

      const itemToDelete = findItemById(fileSystem, id)
      if (!itemToDelete) return

      const newFileSystem = removeItemFromTree(fileSystem, id)
      updateFileSystem(newFileSystem, `Deleted "${itemToDelete.name}"`)
    },
    [fileSystem, findItemById, removeItemFromTree, updateFileSystem],
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      const itemInfo = findItemAndParent(fileSystem, id)
      if (!itemInfo) return

      const { item: itemToDuplicate, parentId = "root", siblings } = itemInfo

      const existingNames = siblings.map((sibling) => sibling.name)
      const newName = generateIncrementedName(itemToDuplicate.name, existingNames)

      const newItem = deepCopyItem(itemToDuplicate)
      newItem.name = newName

      const newFileSystem = addItemToTree(fileSystem, parentId, newItem)
      updateFileSystem(newFileSystem, `Duplicated "${itemToDuplicate.name}" as "${newName}"`)
    },
    [fileSystem, addItemToTree, updateFileSystem],
  )

  const handleAddItem = useCallback(
    (parentId: string, type: "file" | "folder", name: string) => {
      if (!name.trim()) return

      const newItem: FileSystemItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        type,
        children: type === "folder" ? [] : undefined,
        expanded: false,
      }

      const newFileSystem = addItemToTree(fileSystem, parentId, newItem)
      updateFileSystem(newFileSystem, `Added ${type} "${name.trim()}"`)
    },
    [fileSystem, addItemToTree, updateFileSystem],
  )

  const loadPresetStructure = useCallback(
    (presetStructure: any[], rootName: string) => {
      const assignIds = (items: any[]): FileSystemItem[] => {
        if (!items || items.length === 0) return []
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

      setFileSystem(ensureRootFolder(newFileSystem))
      addToHistory(newFileSystem, `Loaded preset structure`)
    },
    [addToHistory, ensureRootFolder, setFileSystem],
  )

  return {
    fileSystem,
    history,
    historyIndex,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleToggleExpanded,
    handleRename,
    handleDelete,
    handleDuplicate,
    handleAddItem,
    loadPresetStructure,
  }
}
